import mongoose, { Document, Schema, Types } from "mongoose";

export type TokenType = Document & {
    token: string;
    user: Types.ObjectId;
    expiresAt: Date;
};

const tokenSchema: Schema = new Schema({
    token: {
        required: true,
        type: String
    },
    user: {
        ref: 'User',
        type: Types.ObjectId
    },
    expiresAt: {
        expires: "10m",
        default: Date.now(),
        type: Date
    }
});

const Token = mongoose.model<TokenType>('Token', tokenSchema);

export default Token;
