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

async function createRequestFromCase(testCase) {
  const payload = {
    input: testCase.input,
    source: 'test-corpus',
    requester: 'demo-user',
  };

  if (testCase.expectedClassification === 'access-request') {
    payload.targetSystem = 'identity-platform';
    payload.requestedAccess = testCase.input.toLowerCase().includes('admin') ? 'temporary-admin' : 'baseline-access';
    payload.justification = 'Scenario data for dashboard visualization.';
    payload.managerApprovalProvided = !testCase.input.toLowerCase().includes('temporary admin');
  }

  return api('/api/requests', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

async function enrichScenario(request) {
  const input = request.input.toLowerCase();

  if (request.classification === 'access-request') {
    await api(`/api/requests/${request.id}/access-review`, { method: 'POST' });
    const approvals = await api(`/api/requests/${request.id}/approvals`);
    if (input.includes('baseline access')) {
      const pending = approvals.find((item) => item.status === 'pending');
      if (pending) {
        await api(`/api/approvals/${pending.id}/approve`, { method: 'POST', body: JSON.stringify({ actor: 'manager-demo' }) });
      }
    }
  }
}

async function seedFromTestsIfNeeded() {
  if (isSeeded()) return;

  const cases = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'request-cases.json'), 'utf8'));
  for (const testCase of cases) {
    const request = await createRequestFromCase(testCase);
    await api(`/api/requests/${request.id}/route`, { method: 'POST' });
    const routed = await api(`/api/requests/${request.id}`);
    await enrichScenario(routed);
  }

  markSeeded();
}

function deriveHumanEvents(item) {
  const approvals = item.approvals || [];
  const events = approvals.map((approval) => ({
    kind: 'approval',
    title: approval.type || 'Approval Review',
    state: approval.status || 'pending',
    role: approval.requiredApproverRole,
    summary: `${approval.requiredApproverRole} ${approval.status || 'pending'} this request.`
  }));

  if (item.status === 'blocked') {
    events.push({
      kind: 'intervention',
      title: 'Human Intervention Required',
      state: 'override',
      role: 'human-operator',
      summary: 'A person must intervene to unblock or redirect this workflow.'
    });
  }

  return events;
}

function deriveExecutionTrace(item) {
  if (item.actualClassification === 'access-request') {
    return [
      { action: 'read-account-state', system: 'identity-platform', detail: 'Inspect account state and current entitlements.' },
      { action: 'compare-requested-access', system: 'identity-platform', detail: 'Compare requested access against policy and role constraints.' },
      { action: 'apply-access-change', system: 'identity-platform', detail: 'Update role or group membership in the backend.' },
      { action: 'verify-access-state', system: 'identity-platform', detail: 'Confirm the requested access is now present.' },
      { action: 'write-audit-artifact', system: 'case-record', detail: 'Store a reviewable access-change note.' }
    ];
  }

  if (item.actualClassification === 'support-issue') {
    return [
      { action: 'read-service-state', system: 'vpn-service', detail: 'Inspect VPN and authentication service signals.' },
      { action: 'diagnose-failure-pattern', system: 'support-analysis', detail: 'Correlate symptoms with a likely root cause.' },
      { action: 'apply-configuration-fix', system: 'vpn-service', detail: 'Tune the relevant backend or service setting.' },
      { action: 'validate-user-recovery', system: 'vpn-service', detail: 'Check that the user can connect again.' },
      { action: 'write-resolution-artifact', system: 'case-record', detail: 'Record the fix and evidence.' }
    ];
  }

  if (item.actualClassification === 'incident') {
    return [
      { action: 'collect-service-signals', system: 'internal-app', detail: 'Gather runtime signals from the affected application.' },
      { action: 'correlate-impact', system: 'incident-analysis', detail: 'Estimate scope and likely blast radius.' },
      { action: 'apply-remediation', system: 'internal-app', detail: 'Apply the chosen mitigation or rollback.' },
      { action: 'verify-service-health', system: 'internal-app', detail: 'Confirm the application is healthy again.' },
      { action: 'write-incident-summary', system: 'case-record', detail: 'Capture the remediation and timeline.' }
    ];
  }

  return [
    { action: 'inspect-change-target', system: 'target-system', detail: 'Read current backend state.' },
    { action: 'prepare-change-plan', system: 'change-analysis', detail: 'Translate the request into a bounded change.' },
    { action: 'apply-change', system: 'target-system', detail: 'Perform the infrastructure update.' },
    { action: 'verify-change', system: 'target-system', detail: 'Confirm the change landed correctly.' },
    { action: 'write-change-artifact', system: 'case-record', detail: 'Store evidence and summary.' }
  ];
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
    const enrichedItem = {
      ...item,
      actualClassification: item.classification,
      actualOwner: item.owner,
      route: buildRoute(item),
      artifact: artifacts[0] || null,
      traceCount: trace.length,
      approvals: requestApprovals,
      trace
    };
    return {
      ...enrichedItem,
      humanEvents: deriveHumanEvents(enrichedItem),
      executionTrace: deriveExecutionTrace(enrichedItem)
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
