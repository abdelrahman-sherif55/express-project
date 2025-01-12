import fs from "fs";
import {NextFunction, Request, Response} from 'express';
import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
import ApiErrors from "./utils/apiErrors";
import Features from "./utils/features";
import sanitization from "./utils/sanitization";
import {FilterData} from "./interfaces/filterData.interface";

export default class RefactorService<modelType> {
    getAll = (model: mongoose.Model<any>, modelName: string) => expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
        let filterData: FilterData = {};
        let searchLength: number = 0;

        if (req.filterData) filterData = req.filterData;

        if (req.query) {
            const searchResult: Features = new Features(model.find(filterData), req.query).filter().search(modelName);
            const searchData: modelType[] = await searchResult.mongooseQuery;
            searchLength = searchData.length;
        }

        const documentCount: number = searchLength || await model.find(filterData).countDocuments();
        const apiFeatures: Features = new Features(model.find(filterData), req.query).filter().sort().limitFields().search(modelName).pagination(documentCount);
        const {mongooseQuery, paginationResult} = apiFeatures;
        let documents: any[] = await mongooseQuery;
        if (modelName === 'users') documents = documents.map(user => sanitization.User(user));
        res.status(200).json({length: documents.length, pagination: paginationResult, data: documents});
    });
    getAllList = (model: mongoose.Model<any>) => expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
        let filterData: FilterData = {};
        let apiFeatures: Features;
        if (req.filterData) filterData = req.filterData;
        apiFeatures = new Features(model.find(filterData), req.query).filter().sort().limitFields();
        const {mongooseQuery} = apiFeatures;
        const documents: modelType[] = await mongooseQuery;
        res.status(200).json({length: documents.length, data: documents});
    });
    getOne = (model: mongoose.Model<any>, modelName?: string) => expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        let document: any = await model.findById(req.params.id);
        if (!document) return next(new ApiErrors(`${req.__('not_found')}`, 404));
        if (modelName === 'users') document = sanitization.User(document);
        res.status(200).json({data: document});
    });
    createOne = (model: mongoose.Model<any>) => expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
        const document: modelType = await model.create(req.body);
        res.status(201).json({data: document});
    });
    updateOne = (model: mongoose.Model<any>) => expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const document: modelType | null = await model.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (!document) return next(new ApiErrors(`${req.__('not_found')}`, 404));
        res.status(200).json({data: document});
    });
    deleteOne = (model: mongoose.Model<any>, folderPath?: string) => expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const document: any = await model.findByIdAndDelete(req.params.id);
        if (!document) return next(new ApiErrors(`${req.__('not_found')}`, 404));
        if (document.cover && document.cover.startsWith(`${process.env.BASE_URL}`)) {
            const cover = document.cover.split('/').pop();
            this.deleteFiles(folderPath!, [cover])
        } else if (document.image && document.image.startsWith(`${process.env.BASE_URL}`)) {
            const image = document.image.split('/').pop();
            this.deleteFiles(folderPath!, [image])
        }
        if (document.images) {
            const images: string[] = document.images.map((image: string) => image.split('/').pop());
            this.deleteFiles(folderPath!, images)
        }
        res.status(204).json({status: "success"});
    });

    deleteFiles(folderPath: string, files: string[]): void {
        files.forEach((file: string): void => {
            const filePath: string = `uploads/${folderPath}/${file}`;
            fs.unlink(filePath, (err): void => {
                if (err) console.error(`Error deleting file ${file}: ${err}`);
                else console.log(`Successfully deleted file ${file}`);
            });
        });
    };
}