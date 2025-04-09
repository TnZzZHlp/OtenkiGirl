-- 晴天女孩应用的数据库结构

-- 用户愿望表
CREATE TABLE IF NOT EXISTS wishes (
    id SERIAL PRIMARY KEY,            -- 自增主键
    contact TEXT NOT NULL,            -- 联系方式（必填）
    place TEXT,                       -- 希望放晴的地点（可选）
    date TEXT,                        -- 希望的时间（可选）
    reason TEXT NOT NULL,             -- 想要晴天的理由（必填）
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- 创建时间
    ip TEXT                           -- 提交者IP地址（可选，用于防止滥用）
);

-- 添加索引以加快查询速度
CREATE INDEX IF NOT EXISTS idx_wishes_timestamp ON wishes(timestamp);

-- 可能的扩展：添加评论表
-- CREATE TABLE IF NOT EXISTS comments (
--     id SERIAL PRIMARY KEY,
--     wish_id INTEGER NOT NULL REFERENCES wishes(id),
--     content TEXT NOT NULL,
--     timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     ip TEXT
-- );
