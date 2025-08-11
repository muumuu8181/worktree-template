const $ = (sel) => document.querySelector(sel);

const state = {
  apiKey: localStorage.getItem('yt_api_key') || '',
  aborter: null,
  startTs: 0,
  count: 0,
  urls: [],
  idSet: new Set(),
};

function setNotice(msg, type = 'info') {
  const el = $('#notice');
  el.textContent = msg || '';
  el.dataset.type = type;
}

function setProgress(p) {
  $('#progressBar').style.width = `${Math.max(0, Math.min(1, p)) * 100}%`;
}

function setStats() {
  $('#count').textContent = String(state.urls.length);
  const elapsed = state.startTs ? ((Date.now() - state.startTs) / 1000).toFixed(1) : '0.0';
  $('#elapsed').textContent = `${elapsed}s`;
}

function updateClipboard() {
  const filter = $('#filterInput').value.trim().toLowerCase();
  const uniqueOnly = $('#uniqueOnly').checked;
  let items = state.urls;
  if (filter) {
    items = items.filter((x) => x.title.toLowerCase().includes(filter) || x.url.toLowerCase().includes(filter));
  }
  if (uniqueOnly) {
    const seen = new Set();
    items = items.filter((x) => {
      if (seen.has(x.url)) return false;
      seen.add(x.url);
      return true;
    });
  }
  $('#clipboard').value = items.map((x) => x.url).join('\n');
  $('#copyBtn').disabled = items.length === 0;
}

function renderList() {
  const container = $('#results');
  container.innerHTML = '';
  const filter = $('#filterInput').value.trim().toLowerCase();
  const uniqueOnly = $('#uniqueOnly').checked;
  let items = state.urls;
  if (filter) {
    items = items.filter((x) => x.title.toLowerCase().includes(filter) || x.url.toLowerCase().includes(filter));
  }
  if (uniqueOnly) {
    const seen = new Set();
    items = items.filter((x) => {
      if (seen.has(x.url)) return false;
      seen.add(x.url);
      return true;
    });
  }
  for (const item of items) {
    const row = document.createElement('div');
    row.className = 'result-item';
    const cbWrap = document.createElement('div');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = true;
    cbWrap.appendChild(cb);
    const info = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'result-title';
    title.textContent = item.title;
    const url = document.createElement('div');
    url.className = 'result-url';
    const a = document.createElement('a');
    a.href = item.url;
    a.textContent = item.url;
    a.target = '_blank';
    url.appendChild(a);
    info.appendChild(title);
    info.appendChild(url);
    row.appendChild(cbWrap);
    row.appendChild(info);
    container.appendChild(row);
  }
}

function resetResults() {
  state.count = 0;
  state.urls = [];
  state.idSet = new Set();
  setProgress(0);
  setStats();
  renderList();
  updateClipboard();
}

function isoDate(dStr, end = false) {
  if (!dStr) return undefined;
  const d = new Date(dStr);
  if (end) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d.toISOString();
}

async function resolveChannelId(apiKey, channelName) {
  if (!channelName) return undefined;
  // Try: search channel by name (type=channel)
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'channel');
  url.searchParams.set('q', channelName);
  url.searchParams.set('maxResults', '5');
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Failed to resolve channel: ${r.status}`);
  const j = await r.json();
  const found = j.items?.[0]?.id?.channelId;
  return found;
}

async function fetchVideos({ apiKey, q, channelId, publishedAfter, publishedBefore, fuzzy, excludeShorts, signal, onPage }) {
  let pageToken = undefined;
  let total = 0;
  const started = Date.now();
  const timeBudgetMs = 60_000; // 1 minute budget
  do {
    if (Date.now() - started > timeBudgetMs) {
      setNotice('タイムアウトにより早期停止しました（約60秒）。', 'warn');
      break;
    }
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', '50');
    if (excludeShorts) {
      url.searchParams.set('videoDuration', 'long');
    }
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    // Fuzzy: do not quote exact phrase; Non-fuzzy: quote for stricter match
    const query = fuzzy ? q : `"${q}"`;
    if (q) url.searchParams.set('q', query);
    if (channelId) url.searchParams.set('channelId', channelId);
    if (publishedAfter) url.searchParams.set('publishedAfter', publishedAfter);
    if (publishedBefore) url.searchParams.set('publishedBefore', publishedBefore);
    const r = await fetch(url, { signal });
    if (!r.ok) throw new Error(`API error: ${r.status}`);
    const j = await r.json();
    const items = (j.items || []).filter((it) => it.id && it.id.videoId);
    total += items.length;
    let results = items.map((it) => ({
      id: it.id.videoId,
      title: it.snippet?.title || '(no title)',
      url: `https://www.youtube.com/watch?v=${it.id.videoId}`,
    }));
    onPage?.(results);
    pageToken = j.nextPageToken;
    setProgress(Math.min(1, (Date.now() - started) / timeBudgetMs));
    setStats();
    await new Promise((res) => setTimeout(res, 50)); // small yield
  } while (pageToken);
}

async function start() {
  resetResults();
  setNotice('検索を開始しました…');
  const apiKey = $('#apiKey').value.trim();
  const q = $('#keywords').value.trim();
  const publishedAfter = isoDate($('#startDate').value, false);
  const publishedBefore = isoDate($('#endDate').value, true);
  const channelName = $('#channelName').value.trim();
  const fuzzy = $('#fuzzy').checked;
  const excludeShorts = $('#shorts').checked;

  $('#startBtn').disabled = true;
  $('#stopBtn').disabled = false;
  $('#copyBtn').disabled = true;
  state.startTs = Date.now();

  const aborter = new AbortController();
  state.aborter = aborter;
  const signal = aborter.signal;

  try {
    const cfg = window.APP_CONFIG || {};
    if (cfg.proxyBase) {
      const url = new URL((cfg.proxyBase.replace(/\/$/, '')) + '/yt/search');
      if (q) url.searchParams.set('q', q);
      if (channelName) url.searchParams.set('channelName', channelName);
      if (publishedAfter) url.searchParams.set('publishedAfter', $('#startDate').value);
      if (publishedBefore) url.searchParams.set('publishedBefore', $('#endDate').value);
      url.searchParams.set('fuzzy', String(!!fuzzy));
      url.searchParams.set('excludeShorts', String(!!excludeShorts));
      setNotice('サーバ経由で動画を取得中…');
      const ctrl = new AbortController();
      const tm = setTimeout(() => ctrl.abort(), 60_000);
      const resp = await fetch(url, { signal: ctrl.signal });
      clearTimeout(tm);
      if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
      const data = await resp.json();
      const items = data.items || [];
      for (const it of items) {
        if (!state.idSet.has(it.id)) {
          state.idSet.add(it.id);
          state.urls.push(it);
        }
      }
      setProgress(1);
      renderList();
      updateClipboard();
      setStats();
      setNotice('完了（サーバ）');
    } else {
      if (!apiKey) {
        setNotice('API Key を入力してください。', 'error');
        return;
      }
      let channelId;
      if (channelName) {
        setNotice('チャンネルIDを解決中…');
        channelId = await resolveChannelId(apiKey, channelName);
        if (!channelId) {
          setNotice('チャンネルが見つかりませんでした。キーワードのみで検索します。', 'warn');
        }
      }
      setNotice('動画を取得中…');
      await fetchVideos({
        apiKey,
        q,
        channelId,
        publishedAfter,
        publishedBefore,
        fuzzy,
        excludeShorts,
        signal,
        onPage: (items) => {
          for (const it of items) {
            if (!state.idSet.has(it.id)) {
              state.idSet.add(it.id);
              state.urls.push(it);
            }
          }
          renderList();
          updateClipboard();
        },
      });
      setNotice('完了');
    }
  } catch (e) {
    if (e.name === 'AbortError') {
      setNotice('ユーザ操作により停止しました。', 'warn');
    } else {
      console.error(e);
      setNotice(`エラー: ${e.message || e}`, 'error');
    }
  } finally {
    $('#startBtn').disabled = false;
    $('#stopBtn').disabled = true;
    setProgress(1);
    setStats();
  }
}

function stop() {
  state.aborter?.abort();
}

function saveKey() {
  const v = $('#apiKey').value.trim();
  localStorage.setItem('yt_api_key', v);
  setNotice('API Key を保存しました。');
}

function init() {
  // If optional config is present and host is allowed, prefill API key.
  try {
    const cfg = window.APP_CONFIG;
    const hostOk = Array.isArray(cfg?.allowedHosts) ? cfg.allowedHosts.includes(location.host) : false;
    if (cfg?.apiKey && hostOk) {
      state.apiKey = cfg.apiKey;
      localStorage.setItem('yt_api_key', cfg.apiKey);
      setNotice('構成ファイルからAPI Keyを読み込みました。');
    }
  } catch {}

  $('#apiKey').value = localStorage.getItem('yt_api_key') || state.apiKey || '';
  $('#saveKeyBtn').addEventListener('click', saveKey);
  $('#startBtn').addEventListener('click', start);
  $('#stopBtn').addEventListener('click', stop);
  $('#clearBtn').addEventListener('click', () => { resetResults(); setNotice('クリアしました。'); });
  $('#copyBtn').addEventListener('click', async () => {
    $('#clipboard').select();
    try { await navigator.clipboard.writeText($('#clipboard').value); setNotice('コピーしました。', 'ok'); }
    catch { document.execCommand('copy'); setNotice('コピーしました。', 'ok'); }
  });
  $('#filterInput').addEventListener('input', () => { renderList(); updateClipboard(); });
  $('#uniqueOnly').addEventListener('change', () => { renderList(); updateClipboard(); });
  $('#selectAll').addEventListener('change', (e) => {
    const checked = e.target.checked;
    document.querySelectorAll('.result-item input[type="checkbox"]').forEach((cb) => { cb.checked = checked; });
  });
}

window.addEventListener('DOMContentLoaded', init);
