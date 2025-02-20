import fs from "fs";
import {NextFunction, Request, Response} from 'express';
import asyncHandler from 'express-async-handler';
import sharp from 'sharp';
import bcrypt from 'bcryptjs';
import usersSchema from "../users/users.schema";
import {Users} from "../users/users.interface";
import RefactorService from "../global/refactor.service";
import {uploadSingleFile} from '../global/middlewares/upload.middleware';
import tokens from '../global/utils/createToken';
import sanitization from "../global/utils/sanitization";

class ProfileService {
    constructor(private readonly refactorService: RefactorService<Users>) {
    }

    uploadImage = uploadSingleFile(['image'], 'image');
    saveImage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        if (req.file) {
            const folderPath: string = 'uploads/images/users';
            if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, {recursive: true});
            const imgName = `user-${Date.now()}.webp`;
            await sharp(req.file.buffer)
                .toFormat('webp')
                .webp({quality: 95})
                .toFile(`uploads/images/users/${imgName}`);
            req.body.image = imgName;

            const user = req.user;
            if (user.image && user.image.startsWith(`${process.env.BASE_URL}`)) {
                const image: string = user.image.split('/').pop();
                this.deleteImage(image);
            }
        }
        next();
    });

    setUserId = (req: Request, res: Response, next: NextFunction) => {
        req.params.id = req.user._id.toString();
        next();
    };
    getProfile = this.refactorService.getOne(usersSchema, 'users');
    updateProfile = asyncHandler(async (req: Request, res: Response) => {
        const user: Users | null = await usersSchema.findByIdAndUpdate(req.user?._id, {
            name: req.body.name,
            image: req.body.image,
        }, {new: true});
        res.status(200).json({data: sanitization.User(user!)});
    });
    createPassword = asyncHandler(async (req: Request, res: Response) => {
        const user: Users | null = await usersSchema.findOneAndUpdate({_id: req.user?._id, hasPassword: false}, {
            password: await bcrypt.hash(req.body.password, 13),
            hasPassword: true
        }, {new: true});
        res.status(200).json({data: sanitization.User(user!)});
    });
    changePassword = asyncHandler(async (req: Request, res: Response) => {
        const user: Users | null = await usersSchema.findByIdAndUpdate(req.user?._id, {
            password: await bcrypt.hash(req.body.password, 13),
            passwordChangedAt: Date.now()
        }, {new: true});
        const token = tokens.createToken(user?._id, user?.role!);
        res.status(200).json({token, data: sanitization.User(user!)});
    });

    deleteImage(image: string): void {
        const imagePath: string = `uploads/images/users/${image}`;
        fs.unlink(imagePath, (err): void => {
            if (err) console.error(`Error deleting image ${image}: ${err}`);
            else console.log(`Successfully deleted image ${image}`);
        });
    };
}

const profileService = new ProfileService(new RefactorService);
export default profileService;