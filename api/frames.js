export default function handler(req, res) {
  const frames = [];
  for (let i = 1; i <= 210; i++) {
    const num = String(i).padStart(3, '0');
    frames.push(`ezgif-frame-${num}.png`);
  }
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json(frames);
}
