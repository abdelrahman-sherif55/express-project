import {Request, Response, NextFunction} from 'express';
import asyncHandler from "express-async-handler";
import sharp from "sharp";
import examplesSchema from "./examples.schema";
import ApiErrors from "../global/utils/apiErrors";
import {Examples} from "./examples.interface";
import {FilterData} from "../global/interfaces/filterData.interface";
import refactorHandler from "../global/refactor.service";
import {uploadMultiFiles, uploadSingleFile} from "../global/middlewares/upload.middleware";
import examplesValidator from "./examples.validation";

class ExamplesService {
    getExamples = refactorHandler.getAll<Examples>(examplesSchema, 'examples');
    getExamplesList = refactorHandler.getAllList<Examples>(examplesSchema);
    getExample = refactorHandler.getOne<Examples>(examplesSchema, 'examples');
    createExample = refactorHandler.createOne<Examples>(examplesSchema);
    updateExample = refactorHandler.updateOne<Examples>(examplesSchema);
    deleteExample = refactorHandler.deleteOne<Examples>(examplesSchema);

    filterExamples = (req: Request, res: Response, next: NextFunction): void => {
        let filterData: FilterData = {};
        filterData.name = 'web';
        req.filterData = filterData;
        next();
    };

    resizeImages = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (req.files) {
            if (req.files.cover) {
                const imageCoverFileName: string = `Example-${req.body.name_en}-${Date.now()}-cover.webp`;
                await sharp(req.files.cover[0].buffer)
                    .toFormat('webp')
                    .webp({quality: 95})
                    .toFile(`uploads/images/Examples/${imageCoverFileName}`);
                req.body.cover = imageCoverFileName;
            }
            if (req.files.images) {
                req.body.images = [];
                await Promise.all(req.files.images.map(async (img: any, index: number): Promise<void> => {
                    const imageName: string = `Example-${Date.now()}N${index + 1}.webp`;
                    await sharp(img.buffer)
                        .toFormat('webp')
                        .webp({quality: 95})
                        .toFile(`uploads/images/Examples/${imageName}`);
                    req.body.images.push(imageName);
                }));
            }
        }
        next();
    });
    resizeImage = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (req.file) {
            const imageName = `Example-${Date.now()}.webp`;
            const example = await examplesSchema.findById(req.params.id);
            if (example?.cover) {
                const image: string = example.cover.split(`${process.env.BASE_URL}/images/Examples/`)[1]
                examplesValidator.deleteUploadedImage(image)
            }
            await sharp(req.file.buffer)
                .toFormat('webp')
                .webp({quality: 95})
                .toFile(`uploads/images/Examples/${imageName}`);
            req.body.image = imageName;
        }
        next();
    });

    ExampleImage = uploadSingleFile(['image'], 'cover')
    ExampleImages = uploadMultiFiles(['image'], [{name: 'cover', maxCount: 1}, {name: 'images', maxCount: 5}]);

    addImages = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const example = await examplesSchema.findById(req.params.id);
        if (!example) return next(new ApiErrors(`${req.__('not_found')}`, 404));
        await examplesSchema.findByIdAndUpdate(example._id, {$addToSet: {images: req.body.images}}, {new: true});
        res.status(200).json({data: example});
    });
    deleteImage = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const example = await examplesSchema.findById(req.params.id);
        if (!example) return next(new ApiErrors(`${req.__('not_found')}`, 404));
        await examplesSchema.findByIdAndUpdate(example._id, {$pull: {images: req.body.images}}, {new: true});
        const exampleImages: string[] = [];
        exampleImages.push(req.body.images);
        examplesValidator.deleteUploadedImages(exampleImages);
        res.status(200).json({data: example});
    });
}

const examplesService = new ExamplesService();
export default examplesService;