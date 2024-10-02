import { Request, Response } from "express";

import Task from "../models/Task";

export class TaskController {
    static createTask = async(req: Request , res: Response) => {
        try {
            const task = new Task(req.body);
            task.project = req.project.id;
            req.project.tasks.push(task.id);
            await Promise.allSettled([task.save(), req.project.save()]);
            res.status(201).json(task);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Ha ocurrido un error al crear la tarea' });
        }
    }
    
    static getProjectTasks = async(req: Request , res: Response) => {
        try {
            const tasks = await Task.find({ project: req.project.id }).populate('project');
            res.json(tasks);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Ha ocurrido un error al recuperar las tareas' });
        }
    }

    static getTaskById = async(req: Request, res: Response) => {
        try {
            const task = await Task.findById(req.task.id)
                .populate({
                    path: 'completedBy.user',
                    select: 'id name email'
                })
                .populate({
                    path: 'notes',
                    select: 'content createdAt task',
                    populate: { path: 'createdBy', select: 'id name email' }
                });
            res.json(task);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Un error ha ocurrido al recuperar la tarea' });
        }
    }

    static updateTask = async(req: Request, res: Response) => {
        try {
            req.task.name = req.body.name;
            req.task.description = req.body.description;
            await req.task.save();
            res.json(req.task);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Ha ocurrido un error mientras se actualizaba la tarea' });
        }
    }

    static deleteTask = async(req: Request, res: Response) => {
        try {
            req.project.tasks = req.project.tasks.filter((task) => task.toString() !== req.params.taskId);
            await Promise.allSettled([
                req.task.deleteOne(),
                req.project.save()
            ]);
            res.json(req.task);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Ha ocurrido un error mientras se borraba la tarea' });
        }
    }

    static updateStatus = async(req: Request, res: Response) => {
        try {
            req.task.status = req.body.status;
            const data = {
                user: req.user.id,
                status: req.body.status
            };
            req.task.completedBy.push(data);
            await req.task.save();
            res.json(req.task);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Ha ocurrido un error mientras se actualizaba el estado de la tarea' });
        }
    }
}
