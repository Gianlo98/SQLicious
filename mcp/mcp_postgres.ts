#!/usr/bin/env node

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import mysql from "mysql2/promise";
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import express from "express";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const app = express();

const DATABASE_NAME = process.env.DB_NAME || "";
const SCHEMA_PATH = "schema";
export async function createMySqlMcpServer() {
    console.log('info', 'Connecting to Postgres database...');

    const databaseUrl = process.env.DB_URL || ""
    const resourceBaseUrl = new URL(databaseUrl);
    resourceBaseUrl.protocol = "postgres:";
    resourceBaseUrl.password = "";

    const pool = new pg.Pool({
        connectionString: databaseUrl,
        ssl: {
            rejectUnauthorized: false, // accetta qualsiasi certificato (usa solo per test o ambienti non sensibili)
        },
    });

    try {
        const client = await pool.connect();
        console.log('info', 'Connected to Postgres database');
        client.release();
    }
    catch (error) {
        console.error('error', 'Failed to connect to Postgres database:', error);
        throw error;
    }

    const server = new McpServer({
        name: "postgres-mcp-server",
        version: "0.1.0",
    });


    server.tool(
        "list_tables",
        "List all tables in the configured database",
        {},
        async () => {
            const client = await pool.connect();
            try {
                const result = await client.query(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
                );
                return {
                    content: result.rows.map((row) => ({
                        type: "text",
                        text: `Table: ${row.table_name}`,
                    })),
                };
            } finally {
                client.release();
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
            const client = await pool.connect();
            try {
                const result = await client.query(
                    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1",
                    [table],
                );

                return {
                    content: [
                        { type: "text", text: `Columns for table: ${table}` },
                        {
                            type: "text",
                            text: JSON.stringify(result.rows, null, 2),
                        },
                    ],
                };
            } finally {
                client.release();
            }
        }
    );

    // Tool 3: Execute a read-only SQL query
    server.tool(
        "execute_query",
        "Execute a Postgres SQL query (read-only) against the database",
        {
            sql: z.string().trim().min(1, "Postgres query is required").describe("The Postgres query to execute"),
        },
        async ({ sql }) => {
            const client = await pool.connect();
            try {
                await client.query("BEGIN TRANSACTION READ ONLY");
                const result = await client.query(sql);
                return {
                    content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }],
                    isError: false,
                };
            } catch (error) {
                throw error;
            } finally {
                client
                    .query("ROLLBACK")
                    .catch((error) =>
                        console.warn("Could not roll back transaction:", error),
                    );

                client.release();
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
