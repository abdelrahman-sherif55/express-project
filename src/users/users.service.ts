import fs from "fs";
import {NextFunction, Request, Response} from 'express';
import asyncHandler from 'express-async-handler';
import sharp from 'sharp';
import bcrypt from 'bcryptjs';
import usersSchema from "./users.schema";
import {Users} from "./users.interface";
import refactorHandler from "../global/refactor.service";
import {uploadSingleFile} from '../global/middlewares/upload.middleware';
import sanitization from "../global/utils/sanitization";

class UserService {
    uploadImage = uploadSingleFile(['image'], 'image');
    saveImage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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
                    this.deleteImage(image)
                }
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
    deleteUser = refactorHandler.deleteOne<Users>(usersSchema, 'images/users');
    changePassword = asyncHandler(async (req: Request, res: Response) => {
        const user = await usersSchema.findByIdAndUpdate(req.params.id, {
            password: await bcrypt.hash(req.body.password, 13),
            passwordChangedAt: Date.now()
        }, {new: true});
        res.status(200).json({data: sanitization.User(user)});
    });

    deleteImage(image: string): void {
        const imagePath: string = `uploads/images/users/${image}`;
        fs.unlink(imagePath, (err): void => {
            if (err) console.error(`Error deleting image ${image}: ${err}`);
            else console.log(`Successfully deleted image ${image}`);
        });
    };
}

const usersService = new UserService();
export default usersService;