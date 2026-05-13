import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

// Cloudflare R2 is S3-compatible — same SDK, different endpoint.
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
  },
});

const BUCKET = process.env.R2_BUCKET_NAME ?? 'lafuente-products';
const PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

// One client per cold start. We don't persist a session — we validate the
// caller's bearer token on every request.
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export const config = {
  // The handler decodes a base64 blob — give it some room. Vercel's default is 1MB.
  maxDuration: 30,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ---- AuthN: must be a signed-in admin (any Supabase user counts here;
  // ---- we lock the panel behind the same auth so this is sufficient).
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  const { data: userData, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !userData.user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // ---- Validate body
  const body = req.body as {
    filename?: string;
    contentType?: string;
    base64?: string;
    productId?: string;
  } | undefined;

  if (!body?.base64 || !body.contentType) {
    return res.status(400).json({ error: 'Missing base64 or contentType' });
  }
  if (!ALLOWED_TYPES.has(body.contentType)) {
    return res.status(400).json({ error: `Unsupported type: ${body.contentType}` });
  }

  const buffer = Buffer.from(body.base64, 'base64');
  if (buffer.length === 0) {
    return res.status(400).json({ error: 'Empty file' });
  }
  // Defensive cap — admins shouldn't upload massive originals; we already
  // compress on the client.
  if (buffer.length > 4 * 1024 * 1024) {
    return res.status(413).json({ error: 'File too large (max 4MB after compression)' });
  }

  // ---- Key: prefix with productId when provided so bulk uploads can target
  // ---- a specific row, otherwise use a random timestamped name.
  const ext = extensionFor(body.contentType);
  const safeProductId = body.productId?.replace(/[^a-zA-Z0-9_-]/g, '') ?? '';
  const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const key = safeProductId
    ? `products/${safeProductId}_${stamp}.${ext}`
    : `uploads/${stamp}.${ext}`;

  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: body.contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }));
  } catch (err) {
    console.error('R2 upload failed:', err);
    return res.status(500).json({
      error: 'Storage upload failed',
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  const publicUrl = `${PUBLIC_URL}/${key}`;
  return res.status(200).json({ url: publicUrl, key });
}

function extensionFor(contentType: string): string {
  switch (contentType) {
    case 'image/jpeg': return 'jpg';
    case 'image/png':  return 'png';
    case 'image/webp': return 'webp';
    case 'image/gif':  return 'gif';
    default:           return 'bin';
  }
}
