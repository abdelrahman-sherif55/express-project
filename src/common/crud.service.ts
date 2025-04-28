import fs from "fs";
import {Request} from 'express';
import mongoose from "mongoose";
import Features from "./utils/features.util";
import {FilterData} from "./interfaces/filter-data.interface";

export default class CrudService<modelType> {
  constructor(private readonly model: mongoose.Model<modelType>, private readonly modelName: string, private readonly folderPath?: string) {
  }

  getAll = async (req: Request) => {
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
    let documents: modelType[] = await mongooseQuery;
    return {length: documents.length, pagination: paginationResult, data: documents};
  };
  getAllList = async (req: Request) => {
    let filterData: FilterData = {};
    let apiFeatures: Features;
    if (req.filterData) filterData = req.filterData;
    apiFeatures = new Features(this.model.find(filterData), req.query).filter().sort().limitFields();
    const {mongooseQuery} = apiFeatures;
    const documents: modelType[] = await mongooseQuery;
    return {length: documents.length, data: documents};
  };
  getOne = async (req: Request) => {
    const document: modelType | null = await this.model.findById(req.params.id);
    return document;
  };
  createOne = async (req: Request) => {
    const document: modelType = await this.model.create(req.body);
    return document;
  };
  updateOne = async (req: Request) => {
    const document: modelType | null = await this.model.findByIdAndUpdate(req.params.id, req.body, {new: true});
    return document;
  };
  deleteOne = async (req: Request) => {
    const document: modelType | null = await this.model.findByIdAndDelete(req.params.id);
    return document;
  };
  addImages = async (req: Request) => {
    const document: modelType | null = await this.model.findByIdAndUpdate(req.params.id, {$addToSet: {images: req.body.images}}, {new: true});
    return document;
  };
  removeImage = async (req: Request) => {
    const document: modelType | null = await this.model.findByIdAndUpdate(req.params.id, {$pull: {images: req.params.image}}, {new: true});
    return document;
  };

  deleteFile(file: string): void {
    const filePath: string = `${this.folderPath}/${file}`;
    fs.unlink(filePath, (err): void => {
      if (err) console.error(`Error deleting file ${file}: ${err}`);
      else console.log(`Successfully deleted file ${file}`);
    });
  };

  deleteFiles(files: string[]): void {
    files.forEach((file: string): void => {
      const filePath: string = `${this.folderPath}/${file}`;
      fs.unlink(filePath, (err): void => {
        if (err) console.error(`Error deleting file ${file}: ${err}`);
        else console.log(`Successfully deleted file ${file}`);
      });
    });
  };
}