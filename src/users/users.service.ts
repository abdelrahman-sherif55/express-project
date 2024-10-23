import {NextFunction, Request, Response} from 'express';
import asyncHandler from 'express-async-handler';
import sharp from 'sharp';
import bcrypt from 'bcryptjs';
import usersSchema from "./users.schema";
import {Users} from "./users.interface";
import refactorHandler from "../global/refactor.service";
import {uploadSingleFile} from '../global/middlewares/upload.middleware';
import usersValidator from "./users.validation";
import sanitization from "../global/utils/sanitization";
import ApiErrors from "../global/utils/apiErrors";

class UserService {
    uploadUserImage = uploadSingleFile(['image'], 'image');
    resizeUserImage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        if (req.file) {
            const imgName = `user-${Date.now()}.webp`
            await sharp(req.file.buffer)
                .toFormat('webp')
                .webp({quality: 95})
                .toFile(`uploads/images/users/${imgName}`)
            req.body.image = imgName;
            const user = await usersSchema.findById(req.params.id);
            if (user && user.image && user.image.startsWith(`${process.env.BASE_URL}`)) {
                const image: string = user.image.split(`${process.env.BASE_URL}/images/users/`)[1];
                usersValidator.deleteUserImage(image)
            }
        }
        next();
    });

    getAllUsers = refactorHandler.getAll<Users>(usersSchema, 'users');
    createUser = refactorHandler.createOne<Users>(usersSchema);
    getUser = refactorHandler.getOne<Users>(usersSchema, 'users');
    updateUser = asyncHandler(async (req: Request, res: Response) => {
        const user = await usersSchema.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            image: req.body.image,
            active: req.body.active
        }, {new: true});
        res.status(200).json({data: sanitization.User(user)});
    });
    deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const user = await usersSchema.findByIdAndDelete(req.params.id);
        if (!user) return next(new ApiErrors(`${req.__('not_found')}`, 404));
        if (user.image && user.image.startsWith(`${process.env.BASE_URL}`)) {
            const image: string = user.image.split(`${process.env.BASE_URL}/images/users/`)[1];
            usersValidator.deleteUserImage(image)
        }
        res.status(204).json();
    });
    changeUserPassword = asyncHandler(async (req: Request, res: Response) => {
        const user = await usersSchema.findByIdAndUpdate(req.params.id, {
            password: await bcrypt.hash(req.body.password, 13),
            passwordChangedAt: Date.now()
        }, {new: true});
        res.status(200).json({data: sanitization.User(user)});
    });
}

const usersService = new UserService();
export default usersService;