// votodata-front/api/leads.js
import { db } from '@vercel-postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 'type' ajuda a diferenciar: 'contato', 'login_attempt', 'acesso_request'
  const { type = 'contato', nome, email, org, perfil, msg, metadata = {} } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório' });
  }

  // 1. Banco de Dados
  let dbError = null;
  try {
    const client = await db.connect();
    await client.sql`
      INSERT INTO leads (type, nome, email, org, perfil, msg, metadata)
      VALUES (${type}, ${nome}, ${email}, ${org}, ${perfil}, ${msg}, ${JSON.stringify(metadata)});
    `;
  } catch (e) {
    console.error('Erro Banco:', e);
    dbError = e;
  }

  // 2. Webhook (Notificação)
  const WEBHOOK_URL = process.env.LEADS_WEBHOOK_URL;
  if (WEBHOOK_URL) {
    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: 'VotoData',
          event: `Novo Lead: ${type}`,
          nome, email, org, perfil, msg,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (e) {
      console.error('Erro Webhook:', e);
    }
  }

  if (!dbError) {
    return res.status(200).json({ success: true, type });
  }

  return res.status(500).json({ error: 'Erro ao processar', fallback: 'mailto' });
}
