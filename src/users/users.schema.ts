import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {Users} from './users.interface';

const usersSchema: mongoose.Schema = new mongoose.Schema<Users>({
  email: {type: String, unique: true, required: true},
  password: {type: String, required: true, minlength: 6, maxlength: 20},
  name: {type: String, required: true, trim: true, minlength: 2, maxlength: 50},
  active: {type: Boolean, default: true},
  role: {type: String, enum: ['admin', 'user'], default: 'user'},
  hasPassword: {type: Boolean, default: true},
  googleId: {type: String},
  image: String,
  passwordChangedAt: Date,
  passwordResetCode: String,
  passwordResetCodeExpires: Date,
  passwordResetCodeVerify: Boolean
}, {timestamps: true});

usersSchema.pre<Users>('save', async function (next: mongoose.CallbackWithoutResultAndOptionalError): Promise<void> {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 13);
  next();
});

const imageUrl = (document: Users): void => {
  if (document.image && document.image.startsWith(`user`))
    document.image = `${process.env.BASE_URL}/images/users/${document.image}`;
};

usersSchema
  .post('init', (document: Users) => imageUrl(document))
  .post('save', (document: Users) => imageUrl(document));

export default mongoose.model<Users>('users', usersSchema);