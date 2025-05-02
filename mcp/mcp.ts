#!/usr/bin/env node

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import mysql from "mysql2/promise";
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const DATABASE_NAME = process.env.DB_NAME || "";
export async function createMySqlMcpServer() {
    console.log('info', 'Connecting to MySQL database...');
    const pool = mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3307', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: DATABASE_NAME,
        connectionLimit: 10,
    });

    try {
        await pool.getConnection();
        console.log('info', 'Connected to MySQL database');
    }
    catch (error) {
        console.error('error', 'Failed to connect to MySQL database:', error);
        throw error;
    }

    const server = new McpServer({
        name: "mysql-mcp-server",
        version: "0.1.0",
    });

    server.tool(
        "list_tables",
        "List all tables in the configured database",
        {},
        async () => {
            try {
                const [rows] = await pool.query(
                    `SELECT table_name as "table_name" FROM information_schema.tables WHERE table_schema = ?`,
                    [DATABASE_NAME]
                );
                const tables = (rows as any[]).map((r) => r.table_name);
                return {
                    content: [
                        { type: "text", text: `Found ${tables.length} tables in ${DATABASE_NAME}` },
                        { type: "text", text: JSON.stringify(tables, null, 2) },
                    ],
                };
            } catch (error) {
                console.error(`Failed to list tables: ${error}`);
                return {
                    content: [
                        { type: "text", text: `Error: ${error instanceof Error ? error.message : error}` },
                    ],
                };
            }
        }
    );

    // Tool 2: Get columns for a specific table
    server.tool(
        "get_columns",
        "Get column definitions for a specific table",
        {
            table: z.string().trim().min(1, "Table name is required").describe("Name of the table"),
        },
        async ({ table }) => {
            try {
                const [cols] = await pool.query(
                    `SELECT column_name, data_type, is_nullable, column_default
           FROM information_schema.columns
           WHERE table_schema = ? AND table_name = ?`,
                    [DATABASE_NAME, table]
                );
                return {
                    content: [
                        { type: "text", text: `Columns for table: ${table}` },
                        { type: "text", text: JSON.stringify(cols, null, 2) },
                    ],
                };
            } catch (error) {
                console.error(`Failed to get columns: ${error}`);
                return {
                    content: [
                        { type: "text", text: `Error: ${error instanceof Error ? error.message : error}` },
                    ],
                };
            }
        }
    );

    // Tool 3: Execute a read-only SQL query
    server.tool(
        "execute_query",
        "Execute a SQL query (read-only) against the database",
        {
            sql: z.string().trim().min(1, "SQL query is required").describe("The SQL query to execute"),
        },
        async ({ sql }) => {
            let conn;
            try {
                conn = await pool.getConnection();
                // Ensure read-only mode
                await conn.query("SET SESSION TRANSACTION READ ONLY");
                await conn.beginTransaction();

                const [rows] = await conn.query(sql);
                // Rollback to avoid any writes
                await conn.rollback();
                // Reset session to read-write
                await conn.query("SET SESSION TRANSACTION READ WRITE");

                return {
                    content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
                };
            } catch (error) {
                console.error(`Query execution failed: ${error}`);
                if (conn) {
                    try {
                        await conn.rollback();
                        await conn.query("SET SESSION TRANSACTION READ WRITE");
                    } catch (_) { }
                }
                return {
                    content: [
                        { type: "text", text: `Error: ${error instanceof Error ? error.message : error}` },
                    ],
                };
            } finally {
                if (conn) conn.release();
            }
        }
    );

    return server;
}


async function main(): Promise<void> {
    try {
        console.log('error', 'Starting server...')
        const server = await createMySqlMcpServer()
        let transport: SSEServerTransport | null = null;

        app.get("/sse", (req, res) => {
            transport = new SSEServerTransport("/messages", res);
            server.connect(transport);
        });

        app.post("/messages", (req, res) => {
            if (transport) {
                transport.handlePostMessage(req, res);
            }
        });

        app.listen(3010);
    } catch (error) {
        console.log('error', 'Fatal error during server startup:', error)
        process.exit(1);
    }
}


main().catch((error) => {
    console.error("Server error:", error instanceof Error ? error.message : error);
    process.exit(1);
});
