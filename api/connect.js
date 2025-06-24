// import mysql from "mysql2/promise";
// import { PrismaClient } from "@prisma/client";
// import dotenv from "dotenv";
// dotenv.config();

// // Database configuration using environment variables
// const dbConfig = {
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT, 10),
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// };

// // Connect to the database
// const connectToDb = async () => {
//   try {
//     const db = await mysql.createConnection(dbConfig);
//     return db;
//   } catch (err) {
//     console.error("Failed to connect to the database: ", err);
//     throw new Error("Database connection failed");
//   }
// };

// const prisma = new PrismaClient();

// export { prisma, connectToDb };
