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

    getAllUsers = this.refactorService.getAll(usersSchema, 'users');
    createUser = this.refactorService.createOne(usersSchema);
    getUser = this.refactorService.getOne(usersSchema, 'users');
    updateUser = asyncHandler(async (req: Request, res: Response) => {
        const user = await usersSchema.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            image: req.body.image,
            active: req.body.active
        }, {new: true});
        res.status(200).json({data: sanitization.User(user)});
    });
    deleteUser = this.refactorService.deleteOne(usersSchema, 'images/users');
    changePassword = asyncHandler(async (req: Request, res: Response) => {
        const user = await usersSchema.findByIdAndUpdate(req.params.id, {
            password: await bcrypt.hash(req.body.password, 13),
            passwordChangedAt: Date.now()
        }, {new: true});
        res.status(200).json({data: sanitization.User(user)});
    });
    checkUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        if (req.params.id === req.user._id.toString()) return next(new ApiErrors(`${req.__('allowed_to')}`, 403));
        next();
    });

    deleteImage(image: string): void {
        const imagePath: string = `uploads/images/users/${image}`;
        fs.unlink(imagePath, (err): void => {
            if (err) console.error(`Error deleting image ${image}: ${err}`);
            else console.log(`Successfully deleted image ${image}`);
        });
    };
}

const usersService = new UserService(new RefactorService);
export default usersService;