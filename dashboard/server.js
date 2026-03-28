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

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function readDb() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
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
  return fs.existsSync(seedStatePath);
}

function markSeeded() {
  fs.writeFileSync(seedStatePath, JSON.stringify({ seeded: true }, null, 2));
}

function seedFromTestsIfNeeded() {
  if (isSeeded()) return;

  const cases = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'request-cases.json'), 'utf8'));
  const nextDb = { requests: [], traces: [], artifacts: [] };

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

  writeDb(nextDb);
  markSeeded();
}

app.get('/api/runtime', (_req, res) => {
  seedFromTestsIfNeeded();
  const db = readDb();
  const requests = db.requests.map((item) => ({
    ...item,
    actualClassification: item.classification,
    actualOwner: item.owner,
    route: buildRoute(item),
    artifact: db.artifacts.find((artifact) => artifact.requestId === item.id) || null,
    traceCount: db.traces.filter((trace) => trace.requestId === item.id).length
  }));

  res.json({
    summary: {
      totalRequests: requests.length,
      classifiedRequests: requests.filter((item) => item.classification).length,
      totalArtifacts: db.artifacts.length
    },
    requests: [...requests].reverse()
  });
});

app.post('/api/runtime/reset-from-tests', (_req, res) => {
  if (fs.existsSync(seedStatePath)) fs.unlinkSync(seedStatePath);
  seedFromTestsIfNeeded();
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`ai-it-team dashboard running at http://localhost:${PORT}`);
});
