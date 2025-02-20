import {Document, Schema} from "mongoose";

export interface Users extends Document {
    readonly _id: Schema.Types.ObjectId;
    readonly email: string;
    password: string;
    readonly name: string;
    readonly active: boolean;
    readonly role: UsersRole;
    readonly googleId: string;
    readonly hasPassword: boolean;
    passwordChangedAt: Date | number;
    passwordResetCode: string | undefined;
    passwordResetCodeExpires: Date | number | undefined;
    passwordResetCodeVerify: boolean | undefined;
    image: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

type UsersRole = 'admin' | 'user';