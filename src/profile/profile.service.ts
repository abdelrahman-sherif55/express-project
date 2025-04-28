import fs from "fs";
import {NextFunction, Request, Response} from 'express';
import asyncHandler from 'express-async-handler';
import sharp from 'sharp';
import bcrypt from 'bcryptjs';
import usersSchema from "../users/users.schema";
import {Users} from "../users/users.interface";
import CrudService from "../common/crud.service";
import {uploadSingleFile} from '../common/middlewares/upload.middleware';
import tokens from '../common/utils/create-token.util';
import sanitization from "../common/utils/sanitization.util";
import {HttpStatusCode} from "../common/enums/status-code.enum";
import {FolderPath, ModelName} from "../common/constants/common.constant";

class ProfileService {
  constructor(private readonly crudService: CrudService<Users>) {
  }

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user: Users | null = await this.crudService.getOne(req);
    res.status(HttpStatusCode.OK).json({data: sanitization.User(user!)});
  });
  updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user: Users | null = await usersSchema.findByIdAndUpdate(req.user?._id, {
      name: req.body.name,
      image: req.body.image,
    }, {new: true});
    res.status(HttpStatusCode.OK).json({data: sanitization.User(user!)});
  });
  createPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user: Users | null = await usersSchema.findOneAndUpdate({_id: req.user?._id, hasPassword: false}, {
      password: await bcrypt.hash(req.body.password, 13),
      hasPassword: true
    }, {new: true});
    res.status(HttpStatusCode.OK).json({data: sanitization.User(user!)});
  });
  changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user: Users | null = await usersSchema.findByIdAndUpdate(req.user?._id, {
      password: await bcrypt.hash(req.body.password, 13),
      passwordChangedAt: Date.now()
    }, {new: true});
    const token: string = tokens.createToken(user?._id, user?.role!);
    res.status(HttpStatusCode.OK).json({token, data: sanitization.User(user!)});
  });

  setUserId = (req: Request, res: Response, next: NextFunction): void => {
    req.params.id = req.user._id.toString();
    next();
  };

  uploadImage = uploadSingleFile(['image'], 'image');
  saveImage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
      const folderPath: string = FolderPath.USERS;
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, {recursive: true});
      const imgName = `user-${Date.now()}.webp`;
      await sharp(req.file.buffer)
        .toFormat('webp')
        .webp({quality: 95})
        .toFile(`${folderPath}/${imgName}`);
      req.body.image = imgName;

      const user: Users = req.user;
      if (user.image && user.image.startsWith('user')) this.crudService.deleteFile(user.image);
    }
    next();
  });
}

const profileService = new ProfileService(new CrudService(usersSchema, ModelName.USERS, FolderPath.USERS));
export default profileService;