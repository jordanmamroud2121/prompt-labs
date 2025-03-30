-- Note: The auth.users table is already created by Supabase Auth

-- API Keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  api_key TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_name)
);

-- RLS policies for api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own API keys" 
  ON api_keys FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own API keys" 
  ON api_keys FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own API keys" 
  ON api_keys FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own API keys" 
  ON api_keys FOR DELETE 
  USING (auth.uid() = user_id);

-- Prompts table
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  title TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  template_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- RLS policies for prompts
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own prompts" 
  ON prompts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own prompts" 
  ON prompts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own prompts" 
  ON prompts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own prompts" 
  ON prompts FOR DELETE 
  USING (auth.uid() = user_id);

-- Responses table
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  response_text TEXT NOT NULL,
  execution_time INTEGER,
  tokens_used INTEGER,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS policies for responses (join with prompts to check user_id)
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own responses" 
  ON responses FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_id AND prompts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can only insert responses to their own prompts" 
  ON responses FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_id AND prompts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can only update their own responses" 
  ON responses FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_id AND prompts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can only delete their own responses" 
  ON responses FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_id AND prompts.user_id = auth.uid()
    )
  );

-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_text TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- RLS policies for templates
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own templates or public templates" 
  ON templates FOR SELECT 
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can only insert their own templates" 
  ON templates FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own templates" 
  ON templates FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own templates" 
  ON templates FOR DELETE 
  USING (auth.uid() = user_id);

-- Variables table
CREATE TABLE variables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, name)
);

-- RLS policies for variables
ALTER TABLE variables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own variables" 
  ON variables FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own variables" 
  ON variables FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own variables" 
  ON variables FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own variables" 
  ON variables FOR DELETE 
  USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_template_id ON prompts(template_id);
CREATE INDEX idx_responses_prompt_id ON responses(prompt_id);
CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_variables_user_id ON variables(user_id); 