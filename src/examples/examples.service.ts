import fs from "fs";
import {NextFunction, Request, Response} from 'express';
import asyncHandler from "express-async-handler";
import sharp from "sharp";
import examplesSchema from "./examples.schema";
import {Examples} from "./examples.interface";
import {FilterData} from "../global/interfaces/filterData.interface";
import RefactorService from "../global/refactor.service";
import {uploadMultiFiles, uploadSingleFile} from "../global/middlewares/upload.middleware";

class ExamplesService {
  constructor(private readonly refactorService: RefactorService<Examples>) {
  }

  getExamples = this.refactorService.getAll;
  getExamplesList = this.refactorService.getAllList;
  getExample = this.refactorService.getOne;
  createExample = this.refactorService.createOne;
  updateExample = this.refactorService.updateOne;
  deleteExample = this.refactorService.deleteOne;
  addImages = this.refactorService.addImages;
  deleteImage = this.refactorService.removeImage;

  filterExamples = (req: Request, res: Response, next: NextFunction): void => {
    const filterData: FilterData = {};
    req.filterData = filterData;
    next();
  };

  saveImages = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.files) {
      const folderPath: string = 'uploads/images/examples';
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, {recursive: true});
      if (req.files.cover) {
        const imageCoverFileName: string = `Example-${req.body.name_en}-${Date.now()}-cover.webp`;
        await sharp(req.files.cover[0].buffer)
          .toFormat('webp')
          .webp({quality: 95})
          .toFile(`uploads/images/examples/${imageCoverFileName}`);
        req.body.cover = imageCoverFileName;

        if (req.params.id) {
          const example = await examplesSchema.findById(req.params.id);
          if (example?.cover) {
            const image: string = example.cover.split('/').pop()!;
            this.deleteUploadedImage(image)
          }
        }
      }
      if (req.files.images) {
        req.body.images = [];
        await Promise.all(req.files.images.map(async (img: any, index: number): Promise<void> => {
          const imageName: string = `Example-${Date.now()}N${index + 1}.webp`;
          await sharp(img.buffer)
            .toFormat('webp')
            .webp({quality: 95})
            .toFile(`uploads/images/examples/${imageName}`);
          req.body.images.push(imageName);
        }));
      }
    }
    next();
  });
  saveImage = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.file) {
      const folderPath: string = 'uploads/images/examples';
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, {recursive: true});
      const imageName = `Example-${Date.now()}.webp`;
      await sharp(req.file.buffer)
        .toFormat('webp')
        .webp({quality: 95})
        .toFile(`uploads/images/examples/${imageName}`);
      req.body.image = imageName;

      if (req.params.id) {
        const example = await examplesSchema.findById(req.params.id);
        if (example?.cover) {
          const image: string = example.cover.split('/').pop()!;
          this.deleteUploadedImage(image)
        }
      }
    }
    next();
  });

  uploadImage = uploadSingleFile(['image'], 'cover')
  uploadImages = uploadMultiFiles(['image'], [{name: 'cover', maxCount: 1}, {name: 'images', maxCount: 5}]);

  deleteUploadedImage(image: string): void {
    const imagePath: string = `uploads/images/examples/${image}`;
    fs.unlink(imagePath, (err): void => {
      if (err) console.error(`Error deleting image ${image}: ${err}`);
      else console.log(`Successfully deleted image ${image}`);
    });
  };
}

const examplesService = new ExamplesService(new RefactorService(examplesSchema, 'examples', 'images/examples'));
export default examplesService;