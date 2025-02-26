import fs from "fs";
import {NextFunction, Request, Response} from 'express';
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import ApiErrors from "./utils/apiErrors";
import Features from "./utils/features";
import sanitization from "./utils/sanitization";
import {FilterData} from "./interfaces/filterData.interface";

export default class RefactorService<modelType> {
  constructor(private readonly model: mongoose.Model<modelType>, private readonly modelName: string, private readonly folderPath?: string) {
  }

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    let filterData: FilterData = {};
    let searchLength: number = 0;
    let flagSearch: boolean = false;

    if (req.filterData) filterData = req.filterData;

    if (req.query) {
      flagSearch = true;
      const searchResult: Features = new Features(this.model.find(filterData), req.query).filter().search(this.modelName);
      const searchData: modelType[] = await searchResult.mongooseQuery;
      searchLength = searchData.length;
    }

    const documentCount: number = flagSearch ? searchLength : await this.model.find(filterData).countDocuments();
    const apiFeatures: Features = new Features(this.model.find(filterData), req.query).filter().sort().limitFields().search(this.modelName).pagination(documentCount);
    const {mongooseQuery, paginationResult} = apiFeatures;
    let documents: modelType[] | any[] = await mongooseQuery;
    if (this.modelName === 'users') documents = documents.map(user => sanitization.User(user));
    res.status(200).json({length: documents.length, pagination: paginationResult, data: documents});
  });
  getAllList = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    let filterData: FilterData = {};
    let apiFeatures: Features;
    if (req.filterData) filterData = req.filterData;
    apiFeatures = new Features(this.model.find(filterData), req.query).filter().sort().limitFields();
    const {mongooseQuery} = apiFeatures;
    const documents: modelType[] = await mongooseQuery;
    res.status(200).json({length: documents.length, data: documents});
  });
  getOne = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let document: modelType | any = await this.model.findById(req.params.id);
    if (!document) return next(new ApiErrors(`${req.__('not_found')}`, 404));
    if (this.modelName === 'users') document = sanitization.User(document);
    res.status(200).json({data: document});
  });
  createOne = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    let document: modelType | any = await this.model.create(req.body);
    if (this.modelName === 'users') document = sanitization.User(document);
    res.status(201).json({data: document});
  });
  updateOne = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const document: modelType | null = await this.model.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if (!document) return next(new ApiErrors(`${req.__('not_found')}`, 404));
    res.status(200).json({data: document});
  });
  deleteOne = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const document: modelType | any = await this.model.findByIdAndDelete(req.params.id);
    if (!document) return next(new ApiErrors(`${req.__('not_found')}`, 404));
    if (document.cover && document.cover.startsWith(`${process.env.BASE_URL}`)) {
      const cover = document.cover.split('/').pop();
      this.deleteFile(cover)
    } else if (document.image && document.image.startsWith(`${process.env.BASE_URL}`)) {
      const image = document.image.split('/').pop();
      this.deleteFile(image)
    }
    if (document.images) {
      const images: string[] = document.images.map((image: string) => image.split('/').pop());
      this.deleteFiles(images)
    }
    res.status(204).json();
  });
  addImages = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const document: modelType | null = await this.model.findByIdAndUpdate(req.params.id, {$addToSet: {images: req.body.images}}, {new: true});
    if (!document) return next(new ApiErrors(`${req.__('not_found')}`, 404));
    res.status(200).json({data: document});
  });
  removeImage = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const document: modelType | null = await this.model.findByIdAndUpdate(req.params.id, {$pull: {images: req.params.image}}, {new: true});
    if (!document) return next(new ApiErrors(`${req.__('not_found')}`, 404));
    this.deleteFile(req.params.image);
    res.status(200).json({data: document});
  });

  deleteFile(file: string): void {
    const filePath: string = `uploads/${this.folderPath}/${file}`;
    fs.unlink(filePath, (err): void => {
      if (err) console.error(`Error deleting file ${file}: ${err}`);
      else console.log(`Successfully deleted file ${file}`);
    });
  };

  deleteFiles(files: string[]): void {
    files.forEach((file: string): void => {
      const filePath: string = `uploads/${this.folderPath}/${file}`;
      fs.unlink(filePath, (err): void => {
        if (err) console.error(`Error deleting file ${file}: ${err}`);
        else console.log(`Successfully deleted file ${file}`);
      });
    });
  };
}