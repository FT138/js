// api/notes.js - Vercel Serverless Function
// 用一个固定 key 存所有笔记（个人使用，单用户）

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const KV_URL      = process.env.KV_REST_API_URL;
  const KV_TOKEN    = process.env.KV_REST_API_TOKEN;

  if (!KV_URL || !KV_TOKEN) {
    return res.status(500).json({ error: 'KV 未配置，请在 Vercel 项目里添加 KV 数据库' });
  }

  const kvFetch = (path, options = {}) =>
    fetch(`${KV_URL}${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
    }).then(r => r.json());

  // GET /api/notes — 读取所有笔记
  if (req.method === 'GET') {
    const data = await kvFetch('/get/memoai_notes');
    const notes = data.result ? JSON.parse(data.result) : [];
    return res.status(200).json({ notes });
  }

  // POST /api/notes — 保存所有笔记
  if (req.method === 'POST') {
    const { notes } = req.body;
    if (!Array.isArray(notes)) return res.status(400).json({ error: '格式错误' });
    await kvFetch('/set/memoai_notes', {
      method: 'POST',
      body: JSON.stringify(JSON.stringify(notes)),
    });
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
