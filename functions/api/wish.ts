import { Client } from "@neondatabase/serverless";

interface Env {
    DATABASE_URL: string;
}

// 创建表的SQL语句
const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS otenki_girl (
    id SERIAL PRIMARY KEY,
    contact TEXT NOT NULL,
    place TEXT,
    date TEXT,
    reason TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip TEXT
);
`;

// 辅助函数：返回JSON响应
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
    });
}

// 修改为符合 Cloudflare Pages Functions 的导出方式
export async function onRequest(context) {
    const { request, env } = context;

    // 处理CORS预检请求
    if (request.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, DELETE",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }

    // 确保 DATABASE_URL 环境变量存在
    if (!env.DATABASE_URL) {
        return jsonResponse({ error: "Database configuration missing" }, 500);
    }

    const client = new Client(env.DATABASE_URL);
    try {
        await client.connect();

        // 确保表已创建
        await client.query(CREATE_TABLE_SQL);

        const url = new URL(request.url);
        const path = url.pathname.split("/").filter(Boolean);

        // REST API 实现逻辑
        if (request.method === "GET") {
            // 获取所有愿望或按ID获取指定愿望
            if (path.length > 1 && !isNaN(Number(path[1]))) {
                // 获取特定ID的愿望
                const id = Number(path[1]);
                const result = await client.query(
                    "SELECT * FROM wishes WHERE id = $1",
                    [id]
                );
                return jsonResponse(result.rows[0] || {});
            } else {
                // 获取所有愿望，按时间戳倒序排列
                const result = await client.query(
                    "SELECT * FROM wishes ORDER BY timestamp DESC LIMIT 100"
                );
                return jsonResponse(result.rows);
            }
        } else if (request.method === "POST") {
            // 创建新愿望
            const data = await request.json();

            // 基本验证
            if (!data.contact || !data.reason) {
                return jsonResponse(
                    { error: "Contact and reason fields are required" },
                    400
                );
            }

            const result = await client.query(
                "INSERT INTO wishes (contact, place, date, reason, ip) VALUES ($1, $2, $3, $4, $5) RETURNING *",
                [
                    data.contact,
                    data.place || null,
                    data.date || null,
                    data.reason,
                    request.headers.get("CF-Connecting-IP") || null,
                ]
            );

            return jsonResponse(result.rows[0], 201);
        } else {
            return jsonResponse({ error: "Method not allowed" }, 405);
        }
    } catch (error) {
        return jsonResponse({ error: error.message }, 500);
    } finally {
        context.waitUntil(client.end());
    }
}
