import mongoose from "mongoose";
import colors from "colors";
import { exit } from 'node:process';

export const connectDB = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.DATABASE_URL);
        const url = `${connection.host}:${connection.port}/${connection.name}`;
        console.log(colors.magenta.bold(`MongoDB connected in ${url}`));
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`.red.bold);
        exit(1);
    }
};
