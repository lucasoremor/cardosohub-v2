import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const form = formidable({ maxFileSize: 25 * 1024 * 1024 });
    const [fields, files] = await form.parse(req);

    const audioFile = files.file?.[0];
    if (!audioFile) return res.status(400).json({ error: 'No audio file' });

    const fd = new FormData();
    fd.append('file', fs.createReadStream(audioFile.filepath), {
      filename: audioFile.originalFilename || 'audio.webm',
      contentType: audioFile.mimetype,
    });
    fd.append('model', 'whisper-1');
    fd.append('language', fields.language?.[0] || 'pt');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...fd.getHeaders(),
      },
      body: fd,
    });

    const data = await response.json();
    fs.unlinkSync(audioFile.filepath);
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
