import {Document, Schema} from 'mongoose';

export interface Examples extends Document {
    readonly _id: Schema.Types.ObjectId;
    readonly name: string;
    cover: string;
    images: string[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
}