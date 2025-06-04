import mongoose from 'mongoose';
import mongooseI18n from 'mongoose-i18n-localize';
import {Examples} from './examples.interface';
import {ModelName} from "../common/constants/models.constant";

const examplesSchema: mongoose.Schema = new mongoose.Schema<Examples>({
  name: {type: String, required: true, trim: true, i18n: true},
  cover: String,
  images: [String]
}, {timestamps: true});

examplesSchema.plugin(mongooseI18n, {locales: ['en', 'ar'], defaultLocale: 'en'});

// examplesSchema.pre<Examples>(/^find/, function (next) {
//     this.populate({ path: 'category', select: 'name_en name_ar' });
//     next();
// });

export default mongoose.model<Examples>(ModelName.EXAMPLES, examplesSchema);