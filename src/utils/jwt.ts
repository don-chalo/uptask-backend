import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

type TokenPayload = {
    id: Types.ObjectId
};

export const generateJWT = (payload: TokenPayload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};