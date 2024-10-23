import {NextFunction, Request, Response} from 'express';
import asyncHandler from 'express-async-handler';
import sharp from 'sharp';
import bcrypt from 'bcryptjs';
import profileValidation from "./profile.validation";
import usersSchema from "../users/users.schema";
import {Users} from "../users/users.interface";
import refactorHandler from "../global/refactor.service";
import {uploadSingleFile} from '../global/middlewares/upload.middleware';
import tokens from '../global/utils/createToken';
import sanitization from "../global/utils/sanitization";

class ProfileService {
    uploadProfileImage = uploadSingleFile(['image'], 'image');
    resizeProfileImage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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
                profileValidation.deleteProfileImage(image)
            }
        }
        next();
    });

    setUserId = (req: Request, res: Response, next: NextFunction) => {
        req.params.id = req.user._id.toString();
        next();
    };
    getProfile = refactorHandler.getOne<Users>(usersSchema, 'users');
    updateProfile = asyncHandler(async (req: Request, res: Response) => {
        const user = await usersSchema.findByIdAndUpdate(req.user?._id, {
            name: req.body.name,
            image: req.body.image,
        }, {new: true});
        res.status(200).json({data: sanitization.User(user)});
    });
    createPassword = asyncHandler(async (req: Request, res: Response) => {
        const user = await usersSchema.findOneAndUpdate({_id: req.user?._id, hasPassword: false}, {
            password: await bcrypt.hash(req.body.password, 13),
            hasPassword: true
        }, {new: true});
        res.status(200).json({data: sanitization.User(user)});
    });
    changePassword = asyncHandler(async (req: Request, res: Response) => {
        const user = await usersSchema.findByIdAndUpdate(req.user?._id, {
            password: await bcrypt.hash(req.body.password, 13),
            passwordChangedAt: Date.now()
        }, {new: true});
        const token = tokens.createToken(user?._id, user?.role!);
        res.status(200).json({token, data: sanitization.User(user)});
    });
}

const profileService = new ProfileService();
export default profileService;