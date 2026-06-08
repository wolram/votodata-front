CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    org TEXT,
    perfil TEXT,
    msg TEXT,
    source TEXT DEFAULT 'votodata-front',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index para buscas rápidas por e-mail (evitar duplicatas no futuro se desejar)
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
