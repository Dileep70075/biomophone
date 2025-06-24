import mysql from "mysql2/promise";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

// Database configuration using environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const pool = mysql.createPool(dbConfig);

const connectToDb = async () => {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (err) {
    console.error("Failed to connect to the database: ", err);
    throw new Error("Database connection failed");
  }
};

export { pool, connectToDb, prisma };
