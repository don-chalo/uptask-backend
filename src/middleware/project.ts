import { Request, Response, NextFunction } from "express";

import Project, { ProjectType } from "../models/Project";

declare global {
    namespace Express {
        interface Request {
            project: ProjectType;
        }
    }
}

export async function projectExists(req: Request, res: Response, next: NextFunction) {
    try{
        const { projectId } = req.params;
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Proyecto no encontrado" });
        }
        req.project = project;
        next();
    } catch(err){
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};
