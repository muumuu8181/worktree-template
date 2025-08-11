import functions from 'firebase-functions';
import admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import { fetch } from 'undici';

try { admin.app(); } catch { admin.initializeApp(); }

// Config via environment or functions config
const CFG = {
  apiKey: process.env.YT_API_KEY || process.env.YOUTUBE_API_KEY || '',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
  allowedUids: (process.env.ALLOWED_UIDS || '').split(',').map(s => s.trim()).filter(Boolean),
};

const app = express();

// CORS
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // Allow same-origin/CLI
    if (!CFG.allowedOrigins.length) return cb(null, true);
    const ok = CFG.allowedOrigins.some(o => origin.startsWith(o));
    cb(ok ? null : new Error('Origin not allowed'));
  },
}));

// Optional auth check (Firebase ID token)
async function verifyAuth(req, res, next) {
  try {
    const hdr = req.headers.authorization || '';
    const m = hdr.match(/^Bearer\s+(.+)$/i);
    if (!m) {
      if (CFG.allowedUids.length) return res.status(401).json({ error: 'auth required' });
      return next();
    }
    const token = m[1];
    const decoded = await admin.auth().verifyIdToken(token);
    if (CFG.allowedUids.length && !CFG.allowedUids.includes(decoded.uid)) {
      return res.status(403).json({ error: 'forbidden' });
    }
    req.user = decoded;
    next();
  } catch (e) {
    if (CFG.allowedUids.length) return res.status(401).json({ error: 'auth invalid' });
    next();
  }
}

app.use(verifyAuth);

function toISO(dStr, end = false) {
  if (!dStr) return undefined;
  const d = new Date(dStr);
  if (end) d.setHours(23, 59, 59, 999); else d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function resolveChannelId(apiKey, name) {
  if (!name) return undefined;
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'channel');
  url.searchParams.set('q', name);
  url.searchParams.set('maxResults', '5');
  const r = await fetch(url);
  if (!r.ok) throw new Error(`resolve channel failed: ${r.status}`);
  const j = await r.json();
  return j.items?.[0]?.id?.channelId;
}

app.get('/yt/search', async (req, res) => {
  if (!CFG.apiKey) return res.status(500).json({ error: 'server api key is not configured' });

  const { q = '', channelName = '', publishedAfter = '', publishedBefore = '', fuzzy = 'true', excludeShorts = 'false' } = req.query;
  const started = Date.now();
  const budget = 60_000;
  const out = [];
  const idSet = new Set();
  let channelId;
  try {
    if (channelName) channelId = await resolveChannelId(CFG.apiKey, String(channelName));
  } catch (e) {
    // Ignore channel resolve errors, fallback to keyword only
  }

  let pageToken;
  do {
    if (Date.now() - started > budget) break;
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('key', CFG.apiKey);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', '50');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const query = String(fuzzy) === 'true' ? String(q) : `"${String(q)}"`;
    if (q) url.searchParams.set('q', query);
    if (channelId) url.searchParams.set('channelId', channelId);
    if (publishedAfter) url.searchParams.set('publishedAfter', toISO(String(publishedAfter), false));
    if (publishedBefore) url.searchParams.set('publishedBefore', toISO(String(publishedBefore), true));
    if (String(excludeShorts) === 'true') url.searchParams.set('videoDuration', 'long');
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).json({ error: 'youtube api error' });
    const j = await r.json();
    const items = (j.items || []).filter(it => it.id && it.id.videoId);
    for (const it of items) {
      if (idSet.has(it.id.videoId)) continue;
      idSet.add(it.id.videoId);
      out.push({ id: it.id.videoId, title: it.snippet?.title || '(no title)', url: `https://www.youtube.com/watch?v=${it.id.videoId}` });
    }
    pageToken = j.nextPageToken;
  } while (pageToken);

  res.json({ items: out, elapsedMs: Date.now() - started });
});

export const api = functions.region('us-central1').https.onRequest(app);
