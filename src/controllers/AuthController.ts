import type { Request, Response } from 'express';

import User from '../models/User';
import { checkPassword, hashPassword } from '../utils/auth';
import { generateToken } from '../utils/token';
import Token from '../models/Token';
import { AuthEmail } from '../emails/AuthEmail';
import { generateJWT } from '../utils/jwt';

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {
            const userExists = await User.findOne({ email: req.body.email });
            if (userExists) {
                const error = new Error('Usuario ya registrado');
                return res.status(409).json({ message: error.message });
            }
            const user = new User(req.body);

            user.password = await hashPassword(req.body.password);

            const token = new Token();
            token.token = generateToken();
            token.user = user.id;

            await AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            });
            await Promise.allSettled([
                user.save(),
                token.save()
            ]);
            res.status(201).json({ message: 'Cuenta creada' });
        } catch (error) {
            res.status(500).json({ message: error.message });
            console.error(error);
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;
            const tokenExist = await Token.findOne({ token });
            if (!tokenExist) {
                return res.status(401).json({ message:'Token no válido' });
            }
            const user = await User.findById(tokenExist.user);
            user.confirmed = true;
            await Promise.allSettled([
                user.save(),
                tokenExist.deleteOne()
            ]);

            res.status(200).json({ message: 'Cuenta confirmada' });
        } catch (error) {
            res.status(500).json({ message: error.message });
            console.error(error);
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            if (!user.confirmed) {
                const token = new Token();
                token.user = user.id;
                token.token = generateToken();
                await token.save();
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                });
                return res.status(401).json({ message: 'Cuenta no confirmada, se ha enviado un e-mail de confirmación' });
            }
            const isPasswordCorrect = await checkPassword(req.body.password, user.password);
            if (!isPasswordCorrect) {
                return res.status(401).json({ message: 'Contraseña inválida' });
            }
            res.status(200).json({ message: 'autenticado', token: generateJWT({ id: user.id }) });
        } catch (error) {
            res.status(500).json({ message: error.message });
            console.error(error);
        }
    };
    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                const error = new Error('Usuario no registrado');
                return res.status(404).json({ message: error.message });
            }

            if (user.confirmed) {
                const error = new Error('Usuario ya confirmado');
                return res.status(403).json({ message: error.message });
            }

            const token = new Token();
            token.token = generateToken();
            token.user = user.id;

            await AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            });
            await Promise.allSettled([ user.save(), token.save() ]);
            res.status(201).json({ message: 'Se envió un nuevo token al e-mail registrado' });
        } catch (error) {
            res.status(500).json({ message: error.message });
            console.error(error);
        }
    };
    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                const error = new Error('Usuario no registrado');
                return res.status(404).json({ message: error.message });
            }

            const token = new Token();
            token.token = generateToken();
            token.user = user.id;
            await token.save();

            await AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            });
            res.status(201).json({ message: 'Se envió un nuevo token al e-mail registrado' });
        } catch (error) {
            res.status(500).json({ message: error.message });
            console.error(error);
        }
    };

    static validateAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;
            const tokenExist = await Token.findOne({ token });
            if (!tokenExist) {
                return res.status(404).json({ message:'Token no válido' });
            }
            res.status(200).json({ message: 'Token válido' });
        } catch (error) {
            res.status(500).json({ message: error.message });
            console.error(error);
        }
    }

    static updatePassword = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;
            const tokenExist = await Token.findOne({ token });
            if (!tokenExist) {
                return res.status(404).json({ message:'Token no válido' });
            }

            const user = await User.findById(tokenExist.user);
            user.password = await hashPassword(req.body.password);
            
            await Promise.allSettled([
                tokenExist.deleteOne(),
                user.save()
            ]);

            res.status(200).json({ message: 'Contraseña actualizada' });
        } catch (error) {
            res.status(500).json({ message: error.message });
            console.error(error);
        }
    };

    static user = async (req: Request, res: Response) => {
        res.json(req.user);
    };

    static updateProfile = async (req: Request, res: Response) => {
        try {
            const { name, email } = req.body;

            const user = await User.findOne({ email });
            if (user && user.id.toString() !== req.user.id.toString()) {
                return res.status(409).json({ message: 'Ya existe un usuario registrado con este correo' });
            }

            req.user.name = name;
            req.user.email = email;
            await req.user.save();
            res.json({ message: 'Perfil actualizado' });
        } catch (error) {
            res.status(500).json({ message: error.message });
            console.error(error);
        }
    };

    static updateCurrentPassword = async (req: Request, res: Response) => {
        try {
            const { 'current-password': currentPassword, password: newPassword } = req.body;
            const user = await User.findById(req.user.id);
            const isPasswordCorrect = await checkPassword(currentPassword, user.password);
            if (!isPasswordCorrect) {
                return res.status(401).json({ message: 'La antigua contraseña es incorrecta' });
            }
            user.password = await hashPassword(newPassword);
            await user.save();
            res.json({ message: 'Contraseña actualizada' });
        } catch (error) {
            res.status(500).json({ message: error.message });
            console.error(error);
        }
    };

    static checkPassword = async (req: Request, res: Response) => {
        try {
            const { password } = req.body;
            const user = await User.findById(req.user.id);
            const isPasswordCorrect = await checkPassword(password, user.password);
            if (isPasswordCorrect) {
                return res.status(200).json({ message: 'Password correcta' });
            }
            res.status(401).json({ message: 'Password incorrecta' });
        } catch (error) {
            res.status(500).json({ message: error.message });
            console.error(error);
        }
    };
}
