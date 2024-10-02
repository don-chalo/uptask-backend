import { Request, Response, NextFunction } from "express";

import Task, { TaskType } from "../models/Task";

declare global {
    namespace Express {
        interface Request {
            task: TaskType;
        }
    }
}

export async function taskExists(req: Request, res: Response, next: NextFunction) {
    try{
        const { taskId } = req.params;
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }
        req.task = task;
        next();
    } catch(err){
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

export async function taskBelongsToProject(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.task.project.toString() !== req.project.id) {
            return res.status(400).json({ message: 'Acción no válida' });
        }
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

export async function hasAuthorization(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.user.id.toString() !== req.project.manager.toString()) {
            return res.status(400).json({ message: 'Acción no válida' });
        }
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};