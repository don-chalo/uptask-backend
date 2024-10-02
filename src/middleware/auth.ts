import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { UserType } from "../models/User";

declare global {
    namespace Express {
        interface Request {
            user: UserType;
        }
    }
};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization;
    if (!bearer) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const [, token] = bearer.split(" ");
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (typeof decoded === 'object' && decoded.id) {
            const user = await User.findById(decoded.id).select('_id email name');
            if (user) {
                req.user = user;
            } else {
                return res.status(500).json({ message: 'Token no válido' });
            }
        }
    } catch(err) {
        console.log(err);
        if (err.constructor === jwt.TokenExpiredError) {
            return res.status(500).json({ message: 'Token expirado' });
        }
        return res.status(500).json({ message: 'Error de servidor' });
    }
    next();
};
