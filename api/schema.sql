CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL, -- 'contato', 'login_attempt', 'acesso_request'
    nome TEXT,
    email TEXT NOT NULL,
    org TEXT,
    perfil TEXT,
    msg TEXT,
    source TEXT DEFAULT 'votodata-front',
    metadata JSONB, -- Para dados extras como URL de origem, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(type);
