import { Request, Response } from 'express';
import User from '../models/User';
import Project from '../models/Project';

export class TeamMemberController {
    static searchMemberByEmail = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email }).select('_id name email');
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            } else {
                return res.status(200).json(user);
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
            console.error(error);
        }
    }

    static addMemberById = async (req: Request, res: Response) => {
        try {
            const { id } = req.body;
            const user = await User.findById(id).select('id');
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            if (req.project.team.some(member => member.toString() === user.id.toString())) {
                return res.status(409).json({ message: 'Usuario ya existe en el proyecto' });
            }
            req.project.team.push(user.id);
            await req.project.save();
            res.status(200).json({ message: 'Usuario agregado al equipo' });
        } catch (error) {
            res.status(400).json({ message: error.message });
            console.error(error);
        }
    }

    static removeMemberById = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            if (!req.project.team.some(member => member.toString() === userId)) {
                return res.status(404).json({ message: 'Usuario no existe en el proyecto' });
            }
            req.project.team = req.project.team.filter(member => member.toString() !== userId);
            req.project.save();
            res.status(200).json({ message: 'Usuario eliminado del equipo' });
        } catch (error) {
            res.status(400).json({ message: error.message });
            console.error(error);
        }
    }

    static getProjectMembers = async (req: Request, res: Response) => {
        try {
            const project = await Project.findById(req.project.id).populate({ path: 'team', select: 'id name email' });
            res.status(200).json(project.team);
        } catch (error) {
            res.status(400).json({ message: error.message });
            console.error(error);
        }
    }
}