import { Request, Response } from "express";

import Project from "../models/Project";

export class ProjectController {
    static getProjects = async (req: Request, res: Response) => {
        try {
            const projects = await Project.find({
                $or: [
                    { manager: {$in: req.user.id} },
                    { team: {$in: req.user.id} }
                ]
            });
            res.json(projects);
        } catch (error) {
            res.status(500).json({ message: error.message });
            console.error(error);
        }
    };
    static getProjectById = async (req: Request, res: Response) => {
        try {
            const project = await Project.findById(req.params.projectId).populate('tasks');
            if (!project) {
                const error = new Error("Proyecto no encontrado");
                return res.status(404).json({ message: error.message });
            }

            if (project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)) {
                return res.status(403).json({ message: 'No tienes permisos para ver este proyecto' });
            }
            res.json(project);
        } catch (error) {
            res.status(500).json({ message: error.message });
            console.error(error);
        }
    };
    static deleteProjectsById = async (req: Request, res: Response) => {
        try {
            // Delete tasks associated with the project.
            await req.project.deleteOne();
            res.json(req.project);
        } catch (error) {
            res.status(500).json({ message: error.message });
            console.error(error);
        }
    };
    static updateProject = async (req: Request, res: Response) => {
        try {
            req.project.clientName = req.body.clientName;
            req.project.description = req.body.description;
            req.project.projectName = req.body.projectName;
            await req.project.save();
            res.json(req.project);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    };
    static createProject = async (req: Request, res: Response) => {
        try {
            const project = new Project(req.body);
            project.manager = req.user.id;
            await project.save();
            res.json(project);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    };
};
