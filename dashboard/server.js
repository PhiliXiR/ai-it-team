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
  const input = testCase.input.toLowerCase();
  const payload = {
    input: testCase.input,
    source: 'test-corpus',
    requester: 'demo-user',
  };

  if (testCase.expectedClassification === 'access-request') {
    payload.targetSystem = input.includes('admin console') ? null : 'identity-platform';
    payload.requestedAccess = input.includes('admin') ? 'temporary-admin' : 'baseline-access';
    payload.justification = input.includes('does not specify') ? null : 'Scenario data for dashboard visualization.';
    payload.managerApprovalProvided = !input.includes('temporary admin') && !input.includes('does not specify');
  }

  return api('/api/requests', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

function syntheticTraceFor(item, approvals = []) {
  const input = item.input.toLowerCase();
  const base = [
    {
      type: 'workflow.entered_queue',
      actor: 'intake',
      data: { summary: 'Request entered the intake queue.' }
    },
    {
      type: 'workflow.classified',
      actor: 'helpdesk-lead',
      data: { summary: `Request classified as ${item.classification}.` }
    },
    {
      type: 'workflow.owner_assigned',
      actor: item.owner,
      data: { summary: `${item.owner} took ownership of the request.` }
    }
  ];

  if (input.includes('does not specify')) {
    base.push(
      {
        type: 'human.clarification.requested',
        actor: 'iam-lead',
        data: { summary: 'Human requester clarification is needed before access work can proceed.' }
      },
      {
        type: 'human.clarification.received',
        actor: 'requester',
        data: { summary: 'The requester provided missing environment and business context.' }
      }
    );
  }

  if (item.classification === 'access-request') {
    base.push(
      {
        type: 'policy.check.started',
        actor: 'iam-lead',
        data: { summary: 'Policy and entitlement review started.' }
      },
      {
        type: 'policy.check.completed',
        actor: 'iam-lead',
        data: { summary: 'Access policy review completed.' }
      }
    );
  }

  if (item.classification === 'support-issue') {
    base.push(
      {
        type: 'execution.read.started',
        actor: item.owner,
        data: { summary: 'Read current service state from the VPN backend.' }
      },
      {
        type: 'execution.change.applied',
        actor: 'vpn-specialist',
        data: { summary: 'Applied a candidate remediation in the VPN service.' }
      },
      {
        type: 'verification.check.passed',
        actor: 'vpn-specialist',
        data: { summary: 'Connectivity verification passed after the change.' }
      }
    );
  }

  if (item.classification === 'incident') {
    base.push(
      {
        type: 'execution.investigation.started',
        actor: 'incident-triage-specialist',
        data: { summary: 'Incident triage began investigating service health.' }
      }
    );

    if (input.includes('incident commander')) {
      base.push(
        {
          type: 'human.decision.requested',
          actor: 'incident-lead',
          data: { summary: 'A human incident commander must choose whether to proceed with rollback.' }
        },
        {
          type: 'human.takeover.started',
          actor: 'incident-commander',
          data: { summary: 'A human incident commander temporarily took control of the decision path.' }
        },
        {
          type: 'human.decision.recorded',
          actor: 'incident-commander',
          data: { summary: 'The human incident commander selected the rollback path.' }
        },
        {
          type: 'human.takeover.completed',
          actor: 'incident-commander',
          data: { summary: 'Control returned to the automated workflow after the human decision.' }
        }
      );
    }

    base.push(
      {
        type: 'execution.change.applied',
        actor: 'incident-lead',
        data: { summary: 'Applied a remediation or rollback to stabilize the service.' }
      },
      {
        type: 'verification.check.passed',
        actor: 'incident-lead',
        data: { summary: 'Service health verification passed.' }
      }
    );
  }

  if (item.classification === 'infrastructure-change') {
    base.push(
      {
        type: 'policy.check.started',
        actor: 'systems-lead',
        data: { summary: 'Change safety review started.' }
      },
      {
        type: 'human.execution.required',
        actor: 'systems-lead',
        data: { summary: 'A human operator must execute the final risky infrastructure step.' }
      },
      {
        type: 'human.execution.completed',
        actor: 'human-operator',
        data: { summary: 'A human operator executed the final infrastructure change step.' }
      },
      {
        type: 'execution.change.applied',
        actor: 'systems-lead',
        data: { summary: 'Applied the requested infrastructure change.' }
      },
      {
        type: 'verification.check.passed',
        actor: 'systems-lead',
        data: { summary: 'Post-change verification passed.' }
      }
    );
  }

  for (const approval of approvals) {
    base.push({
      type: approval.status === 'approved' ? 'human.approval.granted' : approval.status === 'rejected' ? 'human.approval.rejected' : 'human.approval.requested',
      actor: approval.requiredApproverRole,
      data: { summary: `${approval.requiredApproverRole} ${approval.status || 'pending'} ${approval.type}.` }
    });
  }

  if (item.status === 'blocked') {
    base.push({
      type: 'human.intervention.required',
      actor: 'human-operator',
      data: { summary: 'A person must intervene before the workflow can continue.' }
    });
  }

  return base;
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
  const input = item.input.toLowerCase();
  const approvals = item.approvals || [];
  const events = approvals.map((approval) => ({
    kind: 'approval',
    title: approval.type || 'Approval Review',
    state: approval.status || 'pending',
    role: approval.requiredApproverRole,
    summary: `${approval.requiredApproverRole} ${approval.status || 'pending'} this request.`
  }));

  if (input.includes('does not specify')) {
    events.unshift({
      kind: 'clarification',
      title: 'Requester Clarification',
      state: 'pending',
      role: 'requester',
      summary: 'The workflow needs a human requester to clarify environment and justification.'
    });
  }

  if (item.actualClassification === 'infrastructure-change') {
    events.push({
      kind: 'execution',
      title: 'Human Execution Step',
      state: 'approved',
      role: 'human-operator',
      summary: 'A human operator executes the final high-risk infrastructure action.'
    });
  }

  if (input.includes('incident commander')) {
    events.push({
      kind: 'decision',
      title: 'Incident Commander Decision',
      state: 'override',
      role: 'incident-commander',
      summary: 'A human incident commander decides whether rollback should proceed.'
    });
  }

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

function mergeAndSortTrace(realTrace, syntheticTrace) {
  const normalizedReal = (realTrace || []).map((entry) => ({
    ...entry,
    synthetic: false,
    sortKey: 1,
  }));

  const normalizedSynthetic = (syntheticTrace || []).map((entry, index) => ({
    id: `synthetic_${index}_${entry.type}`,
    requestId: null,
    timestamp: null,
    synthetic: true,
    sortKey: 2,
    ...entry,
  }));

  return [...normalizedReal, ...normalizedSynthetic];
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
      approvals: requestApprovals,
    };
    const syntheticTrace = syntheticTraceFor(enrichedItem, requestApprovals);
    const mergedTrace = mergeAndSortTrace(trace, syntheticTrace);
    return {
      ...enrichedItem,
      trace: mergedTrace,
      traceCount: mergedTrace.length,
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
