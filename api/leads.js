// votodata-front/api/leads.js
import { db } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nome, email, org, perfil, msg } = req.body;

  // 1. Tentar salvar no Banco de Dados (Vercel Postgres)
  let dbError = null;
  try {
    const client = await db.connect();
    await client.sql`
      INSERT INTO leads (nome, email, org, perfil, msg)
      VALUES (${nome}, ${email}, ${org}, ${perfil}, ${msg});
    `;
  } catch (e) {
    console.error('Erro ao salvar no Banco:', e);
    dbError = e;
  }

  // 2. Tentar enviar para o Webhook (n8n, Slack, etc)
  const WEBHOOK_URL = process.env.LEADS_WEBHOOK_URL;
  let webhookStatus = 'not_configured';
  
  if (WEBHOOK_URL) {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: 'VotoData',
          nome, email, org, perfil, msg,
          db_saved: !dbError,
          timestamp: new Date().toISOString()
        }),
      });
      webhookStatus = response.ok ? 'sent' : 'failed';
    } catch (e) {
      console.error('Erro no Webhook:', e);
      webhookStatus = 'error';
    }
  }

  // Se salvou no banco ou enviou o webhook, consideramos sucesso
  if (!dbError || webhookStatus === 'sent') {
    return res.status(200).json({ 
      success: true, 
      message: 'Lead capturado com sucesso',
      details: { database: !dbError, webhook: webhookStatus }
    });
  }

  // Se tudo falhar, retornamos erro para o frontend disparar o mailto:
  return res.status(500).json({ 
    error: 'Falha total na captura automática',
    fallback: 'mailto'
  });
}
