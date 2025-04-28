import fs from "fs";
import {NextFunction, Request, Response} from 'express';
import asyncHandler from 'express-async-handler';
import sharp from 'sharp';
import bcrypt from 'bcryptjs';
import usersSchema from "./users.schema";
import {Users} from "./users.interface";
import CrudService from "../common/crud.service";
import {uploadSingleFile} from '../common/middlewares/upload.middleware';
import sanitization from "../common/utils/sanitization.util";
import ApiErrors from "../common/utils/api-errors.util";
import {HttpStatusCode} from "../common/enums/status-code.enum";
import {FolderPath, ModelName} from "../common/constants/common.constant";

class UserService {
  constructor(private readonly crudService: CrudService<Users>) {
  }

  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.crudService.getAll(req);
    res.status(HttpStatusCode.OK).json({
      ...data,
      data: data.data.map((user: Users) => sanitization.User(user))
    });
  });
  getUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user: Users | null = await this.crudService.getOne(req);
    if (!user) return next(new ApiErrors(`${req.__('not_found')}`, HttpStatusCode.NOT_FOUND));
    res.status(HttpStatusCode.OK).json({data: sanitization.User(user)});
  });
  createUser = asyncHandler(async (req: Request, res: Response) => {
    const user: Users = await this.crudService.createOne(req);
    res.status(HttpStatusCode.CREATED).json({data: sanitization.User(user)});
  });
  updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user: Users | null = await usersSchema.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      image: req.body.image,
      active: req.body.active
    }, {new: true});
    if (!user) return next(new ApiErrors(`${req.__('not_found')}`, HttpStatusCode.NOT_FOUND));
    res.status(HttpStatusCode.OK).json({data: sanitization.User(user)});
  });
  deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user: Users | null = await this.crudService.deleteOne(req);
    if (!user) return next(new ApiErrors(`${req.__('not_found')}`, HttpStatusCode.NOT_FOUND));
    if (user.image && user.image.startsWith('user')) this.crudService.deleteFile(user.image)
    res.status(HttpStatusCode.OK).json({data: sanitization.User(user)});
  });
  changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user: Users | null = await usersSchema.findByIdAndUpdate(req.params.id, {
      password: await bcrypt.hash(req.body.password, 13),
      passwordChangedAt: Date.now()
    }, {new: true});
    if (!user) return next(new ApiErrors(`${req.__('not_found')}`, HttpStatusCode.NOT_FOUND));
    res.status(HttpStatusCode.OK).json({data: sanitization.User(user)});
  });
  checkUser = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.params.id === req.user._id.toString()) return next(new ApiErrors(`${req.__('allowed_to')}`, HttpStatusCode.FORBIDDEN));
    next();
  });

  uploadImage = uploadSingleFile(['image'], 'image');
  saveImage = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.file) {
      const folderPath: string = FolderPath.USERS;
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, {recursive: true});
      const imgName = `user-${Date.now()}.webp`
      await sharp(req.file.buffer)
        .toFormat('webp')
        .webp({quality: 95})
        .toFile(`${folderPath}/${imgName}`)
      req.body.image = imgName;

      if (req.params.id) {
        const user: Users | null = await usersSchema.findById(req.params.id);
        if (user && user.image && user.image.startsWith('user')) this.crudService.deleteFile(user.image);
      }
    }
    next();
  });
}

const usersService = new UserService(new CrudService(usersSchema, ModelName.USERS, FolderPath.USERS));
export default usersService;