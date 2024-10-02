import { Request, Response } from "express";

import Note, { NoteType } from "../models/Note";
import { Types } from "mongoose";

type NoteParams = {
    noteId: Types.ObjectId
};

export class NoteController {
    static async createNote(req: Request<{}, {}, NoteType>, res: Response) {
        try {
            const { content } = req.body;
            const note = new Note({ content, createdBy: req.user.id, task: req.task.id });
            req.task.notes.push(note.id);
            await Promise.allSettled([note.save(), req.task.save()]);
            res.status(201).json({ message: 'Nota creada exitosamente' });
        } catch (error) {
            res.status(500).json({ message: 'Ha ocurrido un error al crear la nota' });
            console.error(error);
        }
    }

    static async getTaskNotes(req: Request, res: Response) {
        try {
            const notes = await Note.find({ task: req.task.id })
                .select('content createdAt updatedAt task')
                .populate({ path: 'createdBy', select: 'id name email' });
            res.json(notes);
        } catch (error) {
            res.status(500).json({ message: 'Ha ocurrido un error al crear la nota' });
            console.error(error);
        }
    }

    static async deleteNote(req: Request<NoteParams>, res: Response) {
        try {
            const note = await Note.findById(req.params.noteId);
            if (!note) {
                return res.status(404).json({ message: 'Nota no encontrada' });
            }
            if (note.createdBy.toString() !== req.user.id.toString()) {
                return res.status(401).json({ message: 'No tienes permisos para eliminar esta nota' });
            }

            req.task.notes = req.task.notes.filter(noteId => noteId.toString() !== req.params.noteId.toString());
            await Promise.allSettled([note.deleteOne(), req.task.save()]);
            res.json({ message: 'Nota eliminada' });
        } catch (error) {
            res.status(500).json({ message: 'Ha ocurrido un error al crear la nota' });
            console.error(error);
        }
    }
}