-- Create tables for the prompt labs application

-- Prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  prompt_text TEXT NOT NULL,
  title VARCHAR(255),
  is_favorite BOOLEAN DEFAULT false,
  template_id UUID,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS prompts_user_id_idx ON prompts(user_id);
CREATE INDEX IF NOT EXISTS prompts_template_id_idx ON prompts(template_id);

-- Responses table
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  model_id VARCHAR(255) NOT NULL,
  response_text TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS responses_prompt_id_idx ON responses(prompt_id);
CREATE INDEX IF NOT EXISTS responses_user_id_idx ON responses(user_id);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_text TEXT NOT NULL,
  category VARCHAR(255),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS templates_user_id_idx ON templates(user_id);
CREATE INDEX IF NOT EXISTS templates_category_idx ON templates(category);

-- Variables table
CREATE TABLE IF NOT EXISTS variables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS variables_user_id_idx ON variables(user_id);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  provider VARCHAR(255) NOT NULL,
  api_key TEXT NOT NULL,
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys(user_id);

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for prompts
-- Users can only see their own prompts
CREATE POLICY prompts_user_select ON prompts FOR SELECT 
  USING (user_id = auth.uid());

-- Users can only insert their own prompts
CREATE POLICY prompts_user_insert ON prompts FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Users can only update their own prompts
CREATE POLICY prompts_user_update ON prompts FOR UPDATE 
  USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());

-- Users can only delete their own prompts
CREATE POLICY prompts_user_delete ON prompts FOR DELETE 
  USING (user_id = auth.uid());

-- Similar policies for other tables
-- Responses
CREATE POLICY responses_user_select ON responses FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY responses_user_insert ON responses FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Templates
CREATE POLICY templates_user_select ON templates FOR SELECT 
  USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY templates_user_insert ON templates FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY templates_user_update ON templates FOR UPDATE 
  USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY templates_user_delete ON templates FOR DELETE 
  USING (user_id = auth.uid());

-- Variables
CREATE POLICY variables_user_select ON variables FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY variables_user_insert ON variables FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY variables_user_update ON variables FOR UPDATE 
  USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY variables_user_delete ON variables FOR DELETE 
  USING (user_id = auth.uid());

-- API Keys
CREATE POLICY api_keys_user_select ON api_keys FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY api_keys_user_insert ON api_keys FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY api_keys_user_update ON api_keys FOR UPDATE 
  USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY api_keys_user_delete ON api_keys FOR DELETE 
  USING (user_id = auth.uid()); 