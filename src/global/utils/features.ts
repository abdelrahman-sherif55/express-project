import mongoose from 'mongoose';
import {PaginationQuery, QueryString, SearchQuery} from '../interfaces/features.interface';

class Features {
    public paginationResult: PaginationQuery = {};

    constructor(public mongooseQuery: mongoose.Query<any[], any>, private readonly queryString: QueryString) {
    };

    filter() {
        const queryStringObj: QueryString = {...this.queryString};
        const executedFields: string[] = ['page', 'limit', 'sort', 'fields', 'search', 'lang'];
        executedFields.forEach((field: string): void => {
            delete queryStringObj[field]
        });
        Object.keys(queryStringObj).forEach((key: string): void => {
            const value = queryStringObj[key];
            if (value === "" || value === null || value === undefined ||
                (Array.isArray(value) && value.length === 0)) {
                delete queryStringObj[key];
            }
        });
        let queryStr: string = JSON.stringify(queryStringObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
        return this;
    };

    sort() {
        if (this.queryString.sort) {
            const sortBy: string = this.queryString.sort.split(',').join(' ');
            this.mongooseQuery = this.mongooseQuery.sort(sortBy);
        } else {
            this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
        }
        return this;
    };

    limitFields() {
        if (this.queryString.fields) {
            const fields: string = this.queryString.fields.split(',').join(' ');
            this.mongooseQuery = this.mongooseQuery.select(fields);
        } else {
            this.mongooseQuery = this.mongooseQuery.select('-__v');
        }
        return this;
    };

    search(modelName: string) {
        if (this.queryString.search) {
            let query: SearchQuery = {};
            if (modelName === '') {
                query.$or = [
                    {prop1: new RegExp(this.queryString.search, 'i')},
                    {prop2: new RegExp(this.queryString.search, 'i')},
                ];
            } else {
                query = {prop: new RegExp(this.queryString.search, 'i')};
            }
            this.mongooseQuery = this.mongooseQuery.find(query);
        }
        return this;
    };

    pagination(countDocument: number) {
        const page: number = this.queryString.page || 1;
        const limit: number = this.queryString.limit || 20;
        const skip: number = (page - 1) * limit;
        const endIndex: number = page * limit;
        const pagination: PaginationQuery = {};
        pagination.currentPage = Number(page);
        pagination.limit = Number(limit);
        pagination.numberOfPages = Math.ceil(countDocument / limit);
        if (endIndex < countDocument) {
            pagination.next = Number(page) + 1;
        }
        if (skip > 0) {
            pagination.prev = Number(page) - 1;
        }
        this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
        this.paginationResult = pagination;
        return this;
    };
}

export default Features;