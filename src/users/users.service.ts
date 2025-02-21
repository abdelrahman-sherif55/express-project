import fs from "fs";
import {NextFunction, Request, Response} from 'express';
import asyncHandler from 'express-async-handler';
import sharp from 'sharp';
import bcrypt from 'bcryptjs';
import usersSchema from "./users.schema";
import {Users} from "./users.interface";
import RefactorService from "../global/refactor.service";
import {uploadSingleFile} from '../global/middlewares/upload.middleware';
import sanitization from "../global/utils/sanitization";
import ApiErrors from "../global/utils/apiErrors";

class UserService {
  constructor(private readonly refactorService: RefactorService<Users>) {
  }

  getAllUsers = this.refactorService.getAll;
  getUser = this.refactorService.getOne;
  createUser = this.refactorService.createOne;
  deleteUser = this.refactorService.deleteOne;

  updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user: Users | null = await usersSchema.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      image: req.body.image,
      active: req.body.active
    }, {new: true});
    if (!user) return next(new ApiErrors(`${req.__('not_found')}`, 404));
    res.status(200).json({data: sanitization.User(user)});
  });
  changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user: Users | null = await usersSchema.findByIdAndUpdate(req.params.id, {
      password: await bcrypt.hash(req.body.password, 13),
      passwordChangedAt: Date.now()
    }, {new: true});
    if (!user) return next(new ApiErrors(`${req.__('not_found')}`, 404));
    res.status(200).json({data: sanitization.User(user)});
  });
  checkUser = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.params.id === req.user._id.toString()) return next(new ApiErrors(`${req.__('allowed_to')}`, 403));
    next();
  });

  uploadImage = uploadSingleFile(['image'], 'image');
  saveImage = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.file) {
      const folderPath: string = 'uploads/images/users';
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, {recursive: true});
      const imgName = `user-${Date.now()}.webp`
      await sharp(req.file.buffer)
        .toFormat('webp')
        .webp({quality: 95})
        .toFile(`uploads/images/users/${imgName}`)
      req.body.image = imgName;

      if (req.params.id) {
        const user = await usersSchema.findById(req.params.id);
        if (user && user.image && user.image.startsWith(`${process.env.BASE_URL}`)) {
          const image: string = user.image.split('/').pop()!;
          this.refactorService.deleteFile(image)
        }
      }
    }
    next();
  });
}

const usersService = new UserService(new RefactorService(usersSchema, 'users', 'images/users'));
export default usersService;