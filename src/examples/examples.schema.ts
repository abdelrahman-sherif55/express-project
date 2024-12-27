import mongoose from 'mongoose';
import {Examples} from './examples.interface';

const examplesSchema: mongoose.Schema = new mongoose.Schema<Examples>({
    name: {type: String, required: true, trim: true},
    cover: String,
    images: [String]
}, {timestamps: true});

const imageUrl = (document: Examples): void => {
    if (document.cover) document.cover = `${process.env.BASE_URL}/images/examples/${document.cover}`;
    if (document.images) document.images = document.images.map((image) => `${process.env.BASE_URL}/images/examples/${image}`);

};

examplesSchema.post('init', (document: Examples): void => {
    imageUrl(document);
}).post('save', (document: Examples): void => {
    imageUrl(document);
});

// examplesSchema.pre<Examples>(/^find/, function (next) {
//     this.populate({ path: 'category', select: 'name_en name_ar' });
//     next();
// });

export default mongoose.model<Examples>('examples', examplesSchema);