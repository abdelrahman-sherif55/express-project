import {Document} from 'mongoose';

export interface Examples extends Document {
    readonly name: string;
    cover: string;
    images: string[];
}