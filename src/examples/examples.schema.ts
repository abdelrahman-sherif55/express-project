import mongoose from 'mongoose';
import {Examples} from './examples.interface';
import {ModelName} from "../common/constants/common.constant";

const examplesSchema: mongoose.Schema = new mongoose.Schema<Examples>({
  name: {type: String, required: true, trim: true},
  cover: String,
  images: [String]
}, {timestamps: true});

// examplesSchema.pre<Examples>(/^find/, function (next) {
//     this.populate({ path: 'category', select: 'name_en name_ar' });
//     next();
// });

export default mongoose.model<Examples>(ModelName.EXAMPLES, examplesSchema);