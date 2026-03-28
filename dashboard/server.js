import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const dbPath = path.join(root, 'api', 'storage', 'db.json');
const seedStatePath = path.join(root, 'dashboard', '.seed-state.json');
const app = express();
const PORT = process.env.PORT || 4411;
const clients = new Set();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function readDb() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

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

function seedFromTestsIfNeeded() {
  if (isSeeded()) return;

  const cases = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'request-cases.json'), 'utf8'));
  const nextDb = { requests: [], traces: [], artifacts: [], approvals: [] };

  for (const testCase of cases) {
    const id = `req_${Math.random().toString(36).slice(2, 10)}`;
    const request = {
      id,
      source: 'test-corpus',
      input: testCase.input,
      status: 'classified',
      classification: testCase.expectedClassification,
      owner: testCase.expectedOwner,
      escalation: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    nextDb.requests.push(request);
    nextDb.traces.push({
      id: `evt_${Math.random().toString(36).slice(2, 10)}`,
      requestId: id,
      type: 'request.created',
      actor: 'seed',
      timestamp: new Date().toISOString(),
      data: { source: 'test-corpus' }
    });
    nextDb.traces.push({
      id: `evt_${Math.random().toString(36).slice(2, 10)}`,
      requestId: id,
      type: 'request.classified',
      actor: 'seed',
      timestamp: new Date().toISOString(),
      data: {
        classification: testCase.expectedClassification,
        owner: testCase.expectedOwner
      }
    });
    nextDb.artifacts.push({
      id: `art_${Math.random().toString(36).slice(2, 10)}`,
      requestId: id,
      type: `${testCase.expectedClassification}-summary`,
      owner: testCase.expectedOwner,
      content: {
        summary: testCase.input,
        classification: testCase.expectedClassification,
        owner: testCase.expectedOwner
      },
      createdAt: new Date().toISOString()
    });
  }

  const accessRequest = nextDb.requests.find((item) => item.classification === 'access-request');
  if (accessRequest) {
    accessRequest.status = 'awaiting-approval';
    accessRequest.owner = 'iam-lead';
    const approvalId = `appr_${Math.random().toString(36).slice(2, 10)}`;
    nextDb.approvals.push({
      id: approvalId,
      requestId: accessRequest.id,
      type: 'privileged-access',
      requestedBy: 'iam-lead',
      requiredApproverRole: 'security-director',
      reason: 'Privileged or incompletely approved access requires additional review.',
      status: 'pending',
      createdAt: new Date().toISOString(),
      resolvedAt: null
    });
    nextDb.traces.push({
      id: `evt_${Math.random().toString(36).slice(2, 10)}`,
      requestId: accessRequest.id,
      type: 'approval.created',
      actor: 'seed',
      timestamp: new Date().toISOString(),
      data: { approvalId }
    });
    nextDb.artifacts.push({
      id: `art_${Math.random().toString(36).slice(2, 10)}`,
      requestId: accessRequest.id,
      type: 'access-review-note',
      owner: 'iam-lead',
      content: {
        summary: 'Access request requires approval before implementation.',
        approvalNeeded: true
      },
      createdAt: new Date().toISOString()
    });
  }

  writeDb(nextDb);
  markSeeded();
}

function buildRuntimePayload() {
  seedFromTestsIfNeeded();
  const db = readDb();
  const requests = db.requests.map((item) => ({
    ...item,
    actualClassification: item.classification,
    actualOwner: item.owner,
    route: buildRoute(item),
    artifact: db.artifacts.find((artifact) => artifact.requestId === item.id) || null,
    traceCount: db.traces.filter((trace) => trace.requestId === item.id).length,
    approvals: db.approvals.filter((approval) => approval.requestId === item.id),
    trace: db.traces.filter((trace) => trace.requestId === item.id)
  }));

  return {
    summary: {
      totalRequests: requests.length,
      classifiedRequests: requests.filter((item) => item.classification).length,
      totalArtifacts: db.artifacts.length,
      awaitingApproval: db.approvals.filter((item) => item.status === 'pending').length
    },
    approvals: db.approvals,
    requests: [...requests].reverse()
  };
}

app.get('/api/runtime', (_req, res) => {
  res.json(buildRuntimePayload());
});

app.get('/api/events/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  clients.add(res);
  res.write(`event: snapshot\ndata: ${JSON.stringify(buildRuntimePayload())}\n\n`);

  req.on('close', () => {
    clients.delete(res);
  });
});

app.post('/api/runtime/reset-from-tests', (_req, res) => {
  if (fs.existsSync(seedStatePath)) fs.unlinkSync(seedStatePath);
  seedFromTestsIfNeeded();
  const payload = buildRuntimePayload();
  sendEvent('runtime.reset', payload);
  res.json({ ok: true });
});

app.post('/api/runtime/approvals/:id/approve', (req, res) => {
  const db = readDb();
  const approval = db.approvals.find((item) => item.id === req.params.id);
  if (!approval) return res.status(404).json({ error: 'Approval not found' });
  approval.status = 'approved';
  approval.resolvedAt = new Date().toISOString();

  const request = db.requests.find((item) => item.id === approval.requestId);
  if (request) {
    request.status = 'in-progress';
    request.owner = 'iam-specialist';
    request.updatedAt = new Date().toISOString();
    db.traces.push({
      id: `evt_${Math.random().toString(36).slice(2, 10)}`,
      requestId: request.id,
      type: 'approval.approved',
      actor: 'dashboard',
      timestamp: new Date().toISOString(),
      data: { approvalId: approval.id }
    });
  }

  writeDb(db);
  const payload = buildRuntimePayload();
  sendEvent('approval.updated', payload);
  res.json({ ok: true });
});

app.post('/api/runtime/approvals/:id/reject', (req, res) => {
  const db = readDb();
  const approval = db.approvals.find((item) => item.id === req.params.id);
  if (!approval) return res.status(404).json({ error: 'Approval not found' });
  approval.status = 'rejected';
  approval.resolvedAt = new Date().toISOString();

  const request = db.requests.find((item) => item.id === approval.requestId);
  if (request) {
    request.status = 'blocked';
    request.updatedAt = new Date().toISOString();
    db.traces.push({
      id: `evt_${Math.random().toString(36).slice(2, 10)}`,
      requestId: request.id,
      type: 'approval.rejected',
      actor: 'dashboard',
      timestamp: new Date().toISOString(),
      data: { approvalId: approval.id }
    });
  }

  writeDb(db);
  const payload = buildRuntimePayload();
  sendEvent('approval.updated', payload);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`ai-it-team dashboard running at http://localhost:${PORT}`);
});
