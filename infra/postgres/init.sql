-- ============================================
-- Smart Kitchen - 数据库初始化脚本
-- ============================================

-- 启用 pgvector 扩展 (用于向量搜索)
CREATE EXTENSION IF NOT EXISTS vector;

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 项目表 (食谱集合)
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'local', -- 'local' | 'collaborative'
    room_id VARCHAR(255),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 食谱表
-- ============================================
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    ingredients JSONB NOT NULL DEFAULT '[]',
    steps JSONB NOT NULL DEFAULT '[]',
    prep_time INTEGER DEFAULT 0,
    cook_time INTEGER DEFAULT 0,
    servings INTEGER DEFAULT 2,
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 食谱向量索引 (用于语义搜索)
-- ALTER TABLE recipes ADD COLUMN IF NOT EXISTS embedding vector(1536);
-- CREATE INDEX IF NOT EXISTS recipes_embedding_idx ON recipes USING ivfflat (embedding vector_cosine_ops);

-- ============================================
-- 冰箱食材表
-- ============================================
CREATE TABLE IF NOT EXISTS fridge_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    expiry_date DATE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 会话表 (Better-Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_recipes_project_id ON recipes(project_id);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_fridge_items_user_id ON fridge_items(user_id);
CREATE INDEX IF NOT EXISTS idx_fridge_items_expiry ON fridge_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- ============================================
-- 更新时间触发器
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fridge_items_updated_at
    BEFORE UPDATE ON fridge_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 初始数据 (可选)
-- ============================================

-- 插入测试用户
INSERT INTO users (email, name) VALUES
    ('demo@example.com', 'Demo User')
ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE users IS '用户表';
COMMENT ON TABLE projects IS '项目/食谱集合表';
COMMENT ON TABLE recipes IS '食谱表';
COMMENT ON TABLE fridge_items IS '冰箱食材表';
COMMENT ON TABLE sessions IS '用户会话表';
