import {FilterData} from "./filter-data.interface";

declare module 'express' {
  interface Request {
    filterData?: FilterData;
    user?: any;
    files?: any;
  }
}
