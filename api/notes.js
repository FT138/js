// api/notes.js - Vercel Serverless Function (Upstash Redis)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
  const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!REDIS_URL || !REDIS_TOKEN) {
    return res.status(500).json({ error: '环境变量未配置' });
  }

  const redisFetch = (cmd) =>
    fetch(`${REDIS_URL}/${cmd}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    }).then(r => r.json());

  // GET — 读取笔记
  if (req.method === 'GET') {
    const data = await redisFetch('get/memoai_notes');
    const notes = data.result ? JSON.parse(data.result) : [];
    return res.status(200).json({ notes });
  }

  // POST — 保存笔记
  if (req.method === 'POST') {
    const { notes } = req.body;
    if (!Array.isArray(notes)) return res.status(400).json({ error: '格式错误' });
    const encoded = encodeURIComponent(JSON.stringify(notes));
    await redisFetch(`set/memoai_notes/${encoded}`);
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
