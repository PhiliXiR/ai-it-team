import express from 'express';
import { readDb, writeDb, makeId } from './lib/store.js';
import { classifyInput } from './lib/router.js';

const app = express();
const PORT = process.env.API_PORT || 4412;

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/requests', (_req, res) => {
  const db = readDb();
  res.json(db.requests);
});

app.get('/api/requests/:id', (req, res) => {
  const db = readDb();
  const request = db.requests.find((item) => item.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  res.json(request);
});

app.post('/api/requests', (req, res) => {
  const input = String(req.body?.input || '').trim();
  if (!input) return res.status(400).json({ error: 'Missing input' });

  const db = readDb();
  const request = {
    id: makeId('req'),
    source: req.body?.source || 'local',
    input,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.requests.push(request);
  db.traces.push({
    id: makeId('evt'),
    requestId: request.id,
    type: 'request.created',
    actor: 'intake',
    timestamp: new Date().toISOString(),
    data: { source: request.source }
  });
  writeDb(db);
  res.status(201).json(request);
});

app.post('/api/requests/:id/route', (req, res) => {
  const db = readDb();
  const request = db.requests.find((item) => item.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const routed = classifyInput(request.input);
  request.classification = routed.classification;
  request.owner = routed.owner;
  request.escalation = routed.escalation;
  request.status = 'classified';
  request.updatedAt = new Date().toISOString();

  const artifact = {
    id: makeId('art'),
    requestId: request.id,
    type: `${routed.classification}-summary`,
    owner: routed.owner,
    content: {
      summary: request.input,
      classification: routed.classification,
      owner: routed.owner,
      escalation: routed.escalation
    },
    createdAt: new Date().toISOString()
  };

  db.artifacts.push(artifact);
  db.traces.push({
    id: makeId('evt'),
    requestId: request.id,
    type: 'request.classified',
    actor: 'router',
    timestamp: new Date().toISOString(),
    data: {
      classification: routed.classification,
      owner: routed.owner,
      escalation: routed.escalation
    }
  });
  db.traces.push({
    id: makeId('evt'),
    requestId: request.id,
    type: 'artifact.created',
    actor: routed.owner,
    timestamp: new Date().toISOString(),
    data: {
      artifactId: artifact.id,
      type: artifact.type
    }
  });

  writeDb(db);
  res.json({ request, artifact });
});

app.get('/api/requests/:id/trace', (req, res) => {
  const db = readDb();
  res.json(db.traces.filter((item) => item.requestId === req.params.id));
});

app.get('/api/requests/:id/artifacts', (req, res) => {
  const db = readDb();
  res.json(db.artifacts.filter((item) => item.requestId === req.params.id));
});

app.get('/api/dashboard/summary', (_req, res) => {
  const db = readDb();
  res.json({
    totalRequests: db.requests.length,
    classifiedRequests: db.requests.filter((item) => item.status === 'classified').length,
    totalArtifacts: db.artifacts.length,
    totalTraceEvents: db.traces.length
  });
});

app.get('/api/dashboard/history', (_req, res) => {
  const db = readDb();
  res.json([...db.requests].reverse().slice(0, 20));
});

app.listen(PORT, () => {
  console.log(`ai-it-team api running at http://localhost:${PORT}`);
});
