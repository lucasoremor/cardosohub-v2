// RAG search - find most relevant notes for a query
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { query, user_id, limit = 5 } = req.body;
    if (!query || !user_id) return res.status(400).json({ error: 'Missing fields' });

    // 1. Embed the query
    const embRes = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: query })
    });

    const embData = await embRes.json();
    const queryEmbedding = embData.data[0].embedding;

    // 2. Search Supabase via RPC
    const sbRes = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/search_notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_KEY,
      },
      body: JSON.stringify({
        query_embedding: queryEmbedding,
        match_user_id: user_id,
        match_count: limit
      })
    });

    const notes = await sbRes.json();

    // Only return notes with similarity > 0.3
    const relevant = Array.isArray(notes)
      ? notes.filter(n => n.similarity > 0.3)
      : [];

    return res.status(200).json({ notes: relevant });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
