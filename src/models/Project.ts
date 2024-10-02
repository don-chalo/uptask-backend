import mongoose, { Document, PopulatedDoc, Schema, Types } from "mongoose";

import Task, { TaskType } from "./Task";
import { UserType } from "./User";
import Note from "./Note";

export interface ProjectType extends Document {
    projectName: string,
    clientName: string,
    description: string,
    tasks: PopulatedDoc<TaskType & Document>[],
    manager: PopulatedDoc<UserType & Document>,
    team: PopulatedDoc<UserType & Document>[]
};

const ProjectSchema: Schema = new Schema(
    {
        projectName: { type: String, required: true, trim: true },
        clientName: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        tasks: [{
            ref: 'Task',
            type: Types.ObjectId
        }],
        team: [{
            ref: 'User',
            type: Types.ObjectId
        }],
        manager: {
            ref: 'User',
            type: Types.ObjectId
        }
    },
    { timestamps: true }
);

// Middleware
ProjectSchema.pre('deleteOne',
    { document: true },
    async function() {
        const projectId = this._id;
        if (!projectId) {
            return;
        }
        const tasks = await Task.find({ project: projectId });
        for ( const task of tasks) {
            await Note.deleteMany({ task: task.id });
        }
        await Task.deleteMany({ project: projectId });
    }
);

const Project = mongoose.model<ProjectType>('Project', ProjectSchema);

export default Project;
