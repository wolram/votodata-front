// site/api/leads.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nome, email, org, perfil, msg } = req.body;

  // Webhook URL configurada no dashboard da Vercel (ex: n8n, Slack, Discord)
  const WEBHOOK_URL = process.env.LEADS_WEBHOOK_URL;

  if (!WEBHOOK_URL) {
    console.error('LEADS_WEBHOOK_URL não configurada');
    return res.status(500).json({ error: 'Erro de configuração no servidor' });
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project: 'VotoData',
        nome,
        email,
        org,
        perfil,
        msg,
        timestamp: new Date().toISOString()
      }),
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      throw new Error('Falha ao enviar para o webhook');
    }
  } catch (error) {
    console.error('Erro no Worker de Leads:', error);
    return res.status(500).json({ error: 'Erro ao processar o lead' });
  }
}
