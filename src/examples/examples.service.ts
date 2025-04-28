import fs from "fs";
import {NextFunction, Request, Response} from 'express';
import asyncHandler from "express-async-handler";
import sharp from "sharp";
import examplesSchema from "./examples.schema";
import {Examples} from "./examples.interface";
import {FilterData} from "../common/interfaces/filter-data.interface";
import CrudService from "../common/crud.service";
import {uploadMultiFiles, uploadSingleFile} from "../common/middlewares/upload.middleware";
import {FolderPath, ModelName} from "../common/constants/common.constant";
import {HttpStatusCode} from "../common/enums/status-code.enum";
import ApiErrors from "../common/utils/api-errors.util";
import sanitization from "../common/utils/sanitization.util";

class ExamplesService {
  constructor(private readonly crudService: CrudService<Examples>) {
  }

  getExamples = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.crudService.getAll(req);
    res.status(HttpStatusCode.OK).json({
      ...data,
      data: data.data.map((example: Examples) => sanitization.Example(example))
    });
  });
  getExamplesList = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.crudService.getAllList(req);
    res.status(HttpStatusCode.OK).json({
      ...data,
      data: data.data.map((example: Examples) => sanitization.Example(example))
    });
  });
  getExample = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const example: Examples | null = await this.crudService.getOne(req);
    if (!example) return next(new ApiErrors(`${req.__('not_found')}`, HttpStatusCode.NOT_FOUND));
    res.status(HttpStatusCode.OK).json({data: sanitization.Example(example)});
  });
  createExample = asyncHandler(async (req: Request, res: Response) => {
    const example: Examples = await this.crudService.createOne(req);
    res.status(HttpStatusCode.CREATED).json({data: sanitization.Example(example)});
  });
  updateExample = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const example: Examples | null = await this.crudService.updateOne(req);
    if (!example) return next(new ApiErrors(`${req.__('not_found')}`, HttpStatusCode.NOT_FOUND));
    res.status(HttpStatusCode.OK).json({data: sanitization.Example(example)});
  });
  deleteExample = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const example: Examples | null = await this.crudService.deleteOne(req);
    if (!example) return next(new ApiErrors(`${req.__('not_found')}`, HttpStatusCode.NOT_FOUND));
    if (example.cover) this.crudService.deleteFile(example.cover)
    if (example.images) this.crudService.deleteFiles(example.images);
    res.status(HttpStatusCode.OK).json({data: sanitization.Example(example)});
  });
  addImages = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const example: Examples | null = await this.crudService.addImages(req);
    if (!example) return next(new ApiErrors(`${req.__('not_found')}`, HttpStatusCode.NOT_FOUND));
    res.status(HttpStatusCode.OK).json({data: sanitization.Example(example)});
  });
  deleteImage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const example: Examples | null = await this.crudService.removeImage(req);
    if (!example) return next(new ApiErrors(`${req.__('not_found')}`, HttpStatusCode.NOT_FOUND));
    this.crudService.deleteFile(req.params.image);
    res.status(HttpStatusCode.OK).json({data: sanitization.Example(example)});
  });

  filterExamples = (req: Request, res: Response, next: NextFunction): void => {
    const filterData: FilterData = {};
    req.filterData = filterData;
    next();
  };

  saveImages = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.files) {
      const folderPath: string = FolderPath.EXAMPLES;
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, {recursive: true});
      if (req.files.cover) {
        const imageCoverFileName: string = `Example-${req.body.name_en}-${Date.now()}-cover.webp`;
        await sharp(req.files.cover[0].buffer)
          .toFormat('webp')
          .webp({quality: 95})
          .toFile(`${FolderPath.EXAMPLES}/${imageCoverFileName}`);
        req.body.cover = imageCoverFileName;

        if (req.params.id) {
          const example: Examples | null = await examplesSchema.findById(req.params.id);
          if (example?.cover) this.crudService.deleteFile(example.cover)
        }
      }
      if (req.files.images) {
        req.body.images = [];
        await Promise.all(req.files.images.map(async (img: any, index: number): Promise<void> => {
          const imageName: string = `Example-${Date.now()}N${index + 1}.webp`;
          await sharp(img.buffer)
            .toFormat('webp')
            .webp({quality: 95})
            .toFile(`${FolderPath.EXAMPLES}/${imageName}`);
          req.body.images.push(imageName);
        }));
      }
    }
    next();
  });
  saveImage = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.file) {
      const folderPath: string = FolderPath.EXAMPLES;
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, {recursive: true});
      const imageName = `Example-${Date.now()}.webp`;
      await sharp(req.file.buffer)
        .toFormat('webp')
        .webp({quality: 95})
        .toFile(`${FolderPath.EXAMPLES}/${imageName}`);
      req.body.image = imageName;

      if (req.params.id) {
        const example: Examples | null = await examplesSchema.findById(req.params.id);
        if (example?.cover) this.crudService.deleteFile(example.cover)
      }
    }
    next();
  });

  uploadImage = uploadSingleFile(['image'], 'cover')
  uploadImages = uploadMultiFiles(['image'], [{name: 'cover', maxCount: 1}, {name: 'images', maxCount: 5}]);

}

const examplesService = new ExamplesService(new CrudService(examplesSchema, ModelName.EXAMPLES, FolderPath.EXAMPLES));
export default examplesService;