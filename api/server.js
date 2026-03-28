import express from 'express';
import { readDb, writeDb, makeId } from './lib/store.js';
import { classifyInput } from './lib/router.js';

const app = express();
const PORT = process.env.API_PORT || 4412;

app.use(express.json());

function ensureArrays(db) {
  if (!db.requests) db.requests = [];
  if (!db.traces) db.traces = [];
  if (!db.artifacts) db.artifacts = [];
  if (!db.approvals) db.approvals = [];
  return db;
}

function addTrace(db, requestId, type, actor, data = {}) {
  db.traces.push({
    id: makeId('evt'),
    requestId,
    type,
    actor,
    timestamp: new Date().toISOString(),
    data
  });
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/requests', (_req, res) => {
  const db = ensureArrays(readDb());
  res.json(db.requests);
});

app.get('/api/requests/:id', (req, res) => {
  const db = ensureArrays(readDb());
  const request = db.requests.find((item) => item.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  res.json(request);
});

app.post('/api/requests', (req, res) => {
  const input = String(req.body?.input || '').trim();
  if (!input) return res.status(400).json({ error: 'Missing input' });

  const db = ensureArrays(readDb());
  const request = {
    id: makeId('req'),
    source: req.body?.source || 'local',
    input,
    requester: req.body?.requester || null,
    targetSystem: req.body?.targetSystem || null,
    requestedAccess: req.body?.requestedAccess || null,
    justification: req.body?.justification || null,
    managerApprovalProvided: Boolean(req.body?.managerApprovalProvided),
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.requests.push(request);
  addTrace(db, request.id, 'request.created', 'intake', { source: request.source });
  writeDb(db);
  res.status(201).json(request);
});

app.post('/api/requests/:id/route', (req, res) => {
  const db = ensureArrays(readDb());
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
  addTrace(db, request.id, 'request.classified', 'router', {
    classification: routed.classification,
    owner: routed.owner,
    escalation: routed.escalation
  });
  addTrace(db, request.id, 'artifact.created', routed.owner, {
    artifactId: artifact.id,
    type: artifact.type
  });

  writeDb(db);
  res.json({ request, artifact });
});

app.post('/api/requests/:id/access-review', (req, res) => {
  const db = ensureArrays(readDb());
  const request = db.requests.find((item) => item.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.classification !== 'access-request') {
    return res.status(400).json({ error: 'Request is not an access request' });
  }

  const privileged = /admin|elevated|privileged/i.test(request.input) || /admin|elevated|privileged/i.test(request.requestedAccess || '');
  const approvalNeeded = privileged || !request.managerApprovalProvided;
  const review = {
    summary: 'IAM lead reviewed the access request for scope, approval needs, and implementation readiness.',
    recommendedOwner: approvalNeeded ? 'iam-lead' : 'iam-specialist',
    escalationRecommended: approvalNeeded,
    escalationTarget: approvalNeeded ? 'security-director' : null,
    escalationReason: approvalNeeded ? 'Privileged or incompletely approved access requires additional review.' : null,
    missingContext: [
      !request.targetSystem ? 'Target system should be explicitly identified.' : null,
      !request.requestedAccess ? 'Requested access level should be explicitly identified.' : null,
      !request.justification ? 'Business justification should be recorded.' : null
    ].filter(Boolean),
    approvalNeeded
  };

  request.status = approvalNeeded ? 'awaiting-approval' : 'in-progress';
  request.owner = review.recommendedOwner;
  request.updatedAt = new Date().toISOString();

  addTrace(db, request.id, 'agent.invoked', 'workflow', { role: 'iam-lead' });
  addTrace(db, request.id, 'agent.completed', 'iam-lead', review);

  let approval = null;
  if (approvalNeeded) {
    approval = {
      id: makeId('appr'),
      requestId: request.id,
      type: privileged ? 'privileged-access' : 'manager-approval',
      requestedBy: 'iam-lead',
      requiredApproverRole: privileged ? 'security-director' : 'human-operator',
      reason: review.escalationReason || 'Approval required before access work continues.',
      status: 'pending',
      createdAt: new Date().toISOString(),
      resolvedAt: null
    };
    db.approvals.push(approval);
    addTrace(db, request.id, 'approval.created', 'workflow', {
      approvalId: approval.id,
      type: approval.type,
      requiredApproverRole: approval.requiredApproverRole
    });
  }

  const artifact = {
    id: makeId('art'),
    requestId: request.id,
    type: 'access-review-note',
    owner: 'iam-lead',
    content: review,
    createdAt: new Date().toISOString()
  };
  db.artifacts.push(artifact);
  addTrace(db, request.id, 'artifact.created', 'iam-lead', {
    artifactId: artifact.id,
    type: artifact.type
  });

  writeDb(db);
  res.json({ request, review, approval, artifact });
});

app.get('/api/requests/:id/trace', (req, res) => {
  const db = ensureArrays(readDb());
  res.json(db.traces.filter((item) => item.requestId === req.params.id));
});

app.get('/api/requests/:id/artifacts', (req, res) => {
  const db = ensureArrays(readDb());
  res.json(db.artifacts.filter((item) => item.requestId === req.params.id));
});

app.get('/api/requests/:id/approvals', (req, res) => {
  const db = ensureArrays(readDb());
  res.json(db.approvals.filter((item) => item.requestId === req.params.id));
});

app.get('/api/approvals', (_req, res) => {
  const db = ensureArrays(readDb());
  res.json(db.approvals);
});

app.post('/api/approvals/:id/approve', (req, res) => {
  const db = ensureArrays(readDb());
  const approval = db.approvals.find((item) => item.id === req.params.id);
  if (!approval) return res.status(404).json({ error: 'Approval not found' });
  approval.status = 'approved';
  approval.resolvedAt = new Date().toISOString();

  const request = db.requests.find((item) => item.id === approval.requestId);
  if (request) {
    request.status = 'in-progress';
    request.owner = 'iam-specialist';
    request.updatedAt = new Date().toISOString();
    addTrace(db, request.id, 'approval.approved', req.body?.actor || 'human-operator', {
      approvalId: approval.id
    });
    addTrace(db, request.id, 'request.resumed', 'workflow', {
      owner: request.owner,
      status: request.status
    });
  }

  writeDb(db);
  res.json({ approval, request });
});

app.post('/api/approvals/:id/reject', (req, res) => {
  const db = ensureArrays(readDb());
  const approval = db.approvals.find((item) => item.id === req.params.id);
  if (!approval) return res.status(404).json({ error: 'Approval not found' });
  approval.status = 'rejected';
  approval.resolvedAt = new Date().toISOString();

  const request = db.requests.find((item) => item.id === approval.requestId);
  if (request) {
    request.status = 'blocked';
    request.updatedAt = new Date().toISOString();
    addTrace(db, request.id, 'approval.rejected', req.body?.actor || 'human-operator', {
      approvalId: approval.id
    });
    addTrace(db, request.id, 'request.blocked', 'workflow', {
      status: request.status
    });
  }

  writeDb(db);
  res.json({ approval, request });
});

app.get('/api/dashboard/summary', (_req, res) => {
  const db = ensureArrays(readDb());
  res.json({
    totalRequests: db.requests.length,
    classifiedRequests: db.requests.filter((item) => item.status === 'classified').length,
    awaitingApproval: db.requests.filter((item) => item.status === 'awaiting-approval').length,
    totalArtifacts: db.artifacts.length,
    totalTraceEvents: db.traces.length,
    totalApprovals: db.approvals.length
  });
});

app.get('/api/dashboard/history', (_req, res) => {
  const db = ensureArrays(readDb());
  res.json([...db.requests].reverse().slice(0, 20));
});

app.listen(PORT, () => {
  console.log(`ai-it-team api running at http://localhost:${PORT}`);
});
