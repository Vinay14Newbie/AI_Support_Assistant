import dotenv from "dotenv";

dotenv.config();

export const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

export const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;

export const COHERE_API_KEY = process.env.COHERE_API_KEY;

export const PORT = process.env.PORT || 5000;
