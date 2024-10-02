import mongoose, { Document, Schema } from "mongoose";

export type UserType = Document & {
    email: string,
    password: string,
    name: string,
    confirmed: boolean
};

const userSchema: Schema = new Schema({
    email: {
        lowercase: true,
        required: true,
        unique: true,
        type: String
    },
    password: {
        required: true,
        type: String
    },
    name: {
        required: true,
        type: String
    },
    confirmed: {
        default: false,
        type: Boolean
    }
});

const User = mongoose.model<UserType>('User', userSchema);

export default User;