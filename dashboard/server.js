import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const seedStatePath = path.join(root, 'dashboard', '.seed-state.json');
const app = express();
const PORT = process.env.PORT || 4411;
const PYTHON_API_BASE = process.env.PYTHON_API_BASE || 'http://127.0.0.1:4413';
const clients = new Set();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function sendEvent(type, payload) {
  const message = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of clients) res.write(message);
}

function buildRoute(result) {
  const base = ['request-queue', 'helpdesk-lead'];
  if (result.owner && result.owner !== 'helpdesk-lead') base.push(result.owner);
  for (const step of result.escalation || []) base.push(step);

  if (result.classification === 'support-issue' && result.owner === 'network-lead') base.push('vpn-system');
  if (result.classification === 'access-request') base.push('idp-system');
  if (result.classification === 'incident') base.push('internal-app');
  if (result.classification === 'infrastructure-change') base.push('firewall-system');

  return [...new Set(base)];
}

function isSeeded() {
  if (!fs.existsSync(seedStatePath)) return false;
  try {
    const state = JSON.parse(fs.readFileSync(seedStatePath, 'utf8'));
    return Boolean(state.seeded);
  } catch {
    return false;
  }
}

function markSeeded() {
  fs.writeFileSync(seedStatePath, JSON.stringify({ seeded: true }, null, 2));
}

async function api(pathname, options = {}) {
  const res = await fetch(`${PYTHON_API_BASE}${pathname}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Python API ${pathname} failed: ${res.status} ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function seedFromTestsIfNeeded() {
  if (isSeeded()) return;

  const cases = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'request-cases.json'), 'utf8'));
  for (const testCase of cases) {
    const request = await api('/api/requests', {
      method: 'POST',
      body: JSON.stringify({ input: testCase.input, source: 'test-corpus' })
    });
    await api(`/api/requests/${request.id}/route`, { method: 'POST' });
  }

  const requests = await api('/api/requests');
  const accessRequest = requests.find((item) => item.classification === 'access-request');
  if (accessRequest) {
    await api(`/api/requests/${accessRequest.id}/access-review`, { method: 'POST' });
  }

  markSeeded();
}

async function buildRuntimePayload() {
  await seedFromTestsIfNeeded();
  const [requests, approvals, summary] = await Promise.all([
    api('/api/requests'),
    api('/api/approvals'),
    api('/api/dashboard/summary')
  ]);

  const enriched = await Promise.all(requests.map(async (item) => {
    const [trace, artifacts, requestApprovals] = await Promise.all([
      api(`/api/requests/${item.id}/trace`),
      api(`/api/requests/${item.id}/artifacts`),
      api(`/api/requests/${item.id}/approvals`)
    ]);
    return {
      ...item,
      actualClassification: item.classification,
      actualOwner: item.owner,
      route: buildRoute(item),
      artifact: artifacts[0] || null,
      traceCount: trace.length,
      approvals: requestApprovals,
      trace
    };
  }));

  return {
    summary: {
      totalRequests: summary.totalRequests,
      classifiedRequests: summary.classifiedRequests,
      totalArtifacts: summary.totalArtifacts,
      awaitingApproval: summary.awaitingApproval
    },
    approvals,
    requests: [...enriched].reverse()
  };
}

app.get('/api/runtime', async (_req, res) => {
  try {
    res.json(await buildRuntimePayload());
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/events/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  clients.add(res);
  res.write(`event: snapshot\ndata: ${JSON.stringify(await buildRuntimePayload())}\n\n`);

  req.on('close', () => {
    clients.delete(res);
  });
});

app.post('/api/runtime/reset-from-tests', async (_req, res) => {
  if (fs.existsSync(seedStatePath)) fs.unlinkSync(seedStatePath);
  const payload = await buildRuntimePayload();
  sendEvent('runtime.reset', payload);
  res.json({ ok: true });
});

app.post('/api/runtime/approvals/:id/approve', async (req, res) => {
  try {
    await api(`/api/approvals/${req.params.id}/approve`, { method: 'POST', body: JSON.stringify({ actor: 'dashboard' }) });
    const payload = await buildRuntimePayload();
    sendEvent('approval.updated', payload);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/runtime/approvals/:id/reject', async (req, res) => {
  try {
    await api(`/api/approvals/${req.params.id}/reject`, { method: 'POST', body: JSON.stringify({ actor: 'dashboard' }) });
    const payload = await buildRuntimePayload();
    sendEvent('approval.updated', payload);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`ai-it-team dashboard running at http://localhost:${PORT}`);
});
