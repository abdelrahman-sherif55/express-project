import {FilterData} from "./filterData.interface";

declare module 'express' {
    interface Request {
        filterData?: FilterData;
        user?: any;
        files?: any;
    }
}
