export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { imageBase64, mimeType, question } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'No image' });

    const imageUrl = `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;
    const q = question || 'List all visible items and their quantities. Be specific and concise.';

    const response = await fetch('https://api.moondream.ai/v1/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Moondream-Auth': process.env.MOONDREAM_API_KEY,
      },
      body: JSON.stringify({ image_url: imageUrl, question: q, stream: false }),
    });

    if (!response.ok) {
      // Fallback to GPT-4o vision if Moondream fails
      const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini', max_tokens: 800,
          messages: [{ role: 'user', content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            { type: 'text', text: `Analisa esta imagem de stock/inventário. Lista TODOS os itens visíveis com as suas quantidades de forma precisa. Formato: "Item: quantidade". Sê específico.` }
          ]}]
        })
      });
      const gptData = await gptRes.json();
      return res.status(200).json({ answer: gptData.choices[0].message.content, source: 'gpt4o' });
    }

    const data = await response.json();
    return res.status(200).json({ answer: data.answer, source: 'moondream' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
