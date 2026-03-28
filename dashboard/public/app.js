const summary = document.getElementById('summary');
const results = document.getElementById('results');
const inspectorRequestList = document.getElementById('inspectorRequestList');
const runtimeStrip = document.getElementById('runtimeStrip');
const refreshBtn = document.getElementById('refreshBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stepBtn = document.getElementById('stepBtn');
const modeVisualBtn = document.getElementById('modeVisualBtn');
const modeInspectBtn = document.getElementById('modeInspectBtn');
const visualModeView = document.getElementById('visualModeView');
const inspectionModeView = document.getElementById('inspectionModeView');
const currentCase = document.getElementById('currentCase');
const flowPipeline = document.getElementById('flowPipeline');
const ticketStatePanel = document.getElementById('ticketStatePanel');
const workflowActivityPanel = document.getElementById('workflowActivityPanel');
const historyList = document.getElementById('historyList');
const queueList = document.getElementById('queueList');
const approvalsList = document.getElementById('approvalsList');
const agentStatusList = document.getElementById('agentStatusList');
const requestSummary = document.getElementById('requestSummary');
const workflowState = document.getElementById('workflowState');
const traceDetail = document.getElementById('traceDetail');
const artifactSummary = document.getElementById('artifactSummary');
const dataObjectsPanel = document.getElementById('dataObjectsPanel');
const pulseDot = document.getElementById('pulseDot');
const topologyWrap = document.getElementById('topologyWrap');
let cases = [];
let approvals = [];
let activeIndex = 0;
let playbackTimer = null;
let history = [];
let currentMode = 'visual';
let selectedRequestId = null;
let playbackPaused = false;
let stageIndexByRequest = new Map();
let autoAdvanceBusy = false;

function statusTag(status) {
  return `status-${status}`;
}

function setMode(mode) {
  currentMode = mode;
  visualModeView.style.display = mode === 'visual' ? 'block' : 'none';
  inspectionModeView.style.display = mode === 'inspect' ? 'block' : 'none';
  modeVisualBtn.classList.toggle('mode-active', mode === 'visual');
  modeInspectBtn.classList.toggle('mode-active', mode === 'inspect');
}

function clearActive() {
  document.querySelectorAll('.node.active, .node.processing').forEach((el) => {
    el.classList.remove('active');
    el.classList.remove('processing');
  });
  pulseDot.style.opacity = 0;
}

function prettifyNodeName(value) {
  return value.replaceAll('-', ' ');
}

function workflowModel(item) {
  const classification = item.actualClassification || 'request';
  const ownerNode = item.actualOwner ? prettifyNodeName(item.actualOwner) : 'Assigned Owner';
  const systemNode = classification === 'support-issue'
    ? 'VPN System'
    : classification === 'access-request'
      ? 'Identity Provider'
      : classification === 'incident'
        ? 'Internal App'
        : 'Target System';
  const specialistNode = classification === 'support-issue'
    ? 'VPN Specialist'
    : classification === 'access-request'
      ? 'IAM Specialist'
      : classification === 'incident'
        ? 'Incident Triage'
        : null;
  const approvalNode = item.status === 'awaiting-approval' || (item.approvals || []).length
    ? 'Approval Gate'
    : null;
  const artifactNode = item.artifact?.type ? prettifyNodeName(item.artifact.type) : 'Artifact';

  const stages = [
    { label: 'Request Queue', type: 'queue', nodeId: null },
    { label: 'Helpdesk Lead', type: 'agent', nodeId: 'helpdesk-lead' },
    { label: ownerNode, type: 'owner', nodeId: item.actualOwner || null },
    specialistNode && specialistNode !== ownerNode
      ? { label: specialistNode, type: 'specialist', nodeId: specialistNode.toLowerCase().replaceAll(' ', '-') }
      : null,
    approvalNode ? { label: approvalNode, type: 'approval', nodeId: 'security-director' } : null,
    { label: systemNode, type: 'system', nodeId: classification === 'support-issue' ? 'vpn-system' : classification === 'access-request' ? 'idp-system' : classification === 'incident' ? 'internal-app' : null },
    { label: artifactNode, type: 'artifact', nodeId: null }
  ].filter(Boolean);

  const defaultCurrent = stages.findIndex((stage) => stage.type === 'owner');
  let currentIndex = defaultCurrent === -1 ? 0 : defaultCurrent;
  if (item.status === 'awaiting-approval') {
    const idx = stages.findIndex((stage) => stage.type === 'approval');
    if (idx !== -1) currentIndex = idx;
  } else if (item.status === 'in-progress') {
    const idx = stages.findIndex((stage) => stage.type === 'system');
    if (idx !== -1) currentIndex = idx;
  }
  return { stages, currentIndex };
}

function getStageIndex(item) {
  const model = workflowModel(item);
  const saved = stageIndexByRequest.get(item.id);
  if (typeof saved === 'number') return Math.max(0, Math.min(saved, model.stages.length - 1));
  return model.currentIndex;
}

function setStageIndex(item, index) {
  const model = workflowModel(item);
  stageIndexByRequest.set(item.id, Math.max(0, Math.min(index, model.stages.length - 1)));
}

function renderFlow(item, stageIndexOverride = null) {
  const { stages, currentIndex } = workflowModel(item);
  const stageIndex = stageIndexOverride ?? currentIndex;
  flowPipeline.innerHTML = stages.map((step, index) => {
    const state = index < stageIndex ? 'completed' : index === stageIndex ? 'current' : 'upcoming';
    return `${index > 0 ? '<span class="flow-arrow">→</span>' : ''}<div class="flow-step ${state}">${step.label}</div>`;
  }).join('');
}

function renderHistory() {
  historyList.innerHTML = history.map((item) => `
    <div class="history-entry">
      <strong>${item.input}</strong>
      <div class="meta">
        <span class="tag">${item.actualOwner}</span>
        <span class="tag ${statusTag(item.status)}">${item.status}</span>
      </div>
    </div>
  `).join('');
}

function renderQueue() {
  queueList.innerHTML = cases.map((item) => `
    <div class="queue-entry request-card" data-request-id="${item.id}">
      <strong>${item.input}</strong>
      <div class="meta">
        <span class="tag ${statusTag(item.status)}">${item.status}</span>
      </div>
    </div>
  `).join('');
}

function renderApprovals() {
  const selected = cases.find((item) => item.id === selectedRequestId);
  const relevant = selected ? (selected.approvals || []) : approvals.filter((item) => item.status === 'pending');
  approvalsList.innerHTML = relevant.length ? relevant.map((item) => `
    <div class="history-entry">
      <strong>${item.type}</strong>
      <div class="meta">
        <span class="tag">requested by: ${item.requestedBy}</span>
        <span class="tag">approver: ${item.requiredApproverRole}</span>
        <span class="tag ${statusTag(item.status || 'awaiting-approval')}">${item.status || 'pending'}</span>
      </div>
      ${item.status === 'pending' ? `
      <div class="meta">
        <button data-action="approve" data-id="${item.id}">Approve</button>
        <button data-action="reject" data-id="${item.id}">Reject</button>
      </div>` : ''}
    </div>
  `).join('') : '<p>No approvals linked to this view.</p>';
}

function renderAgentStatus() {
  const selected = cases.find((item) => item.id === selectedRequestId);
  if (!selected) {
    agentStatusList.innerHTML = '<p>No request selected.</p>';
    return;
  }
  const recent = selected.trace?.slice(-3) || [];
  agentStatusList.innerHTML = `
    <div class="history-entry">
      <strong>Current Owner</strong>
      <div class="meta"><span class="tag">${selected.actualOwner}</span></div>
    </div>
    ${recent.map((entry) => `
      <div class="history-entry">
        <strong>${entry.type}</strong>
        <div class="meta"><span class="tag">${entry.actor}</span></div>
      </div>
    `).join('')}
  `;
}

function renderVisualState(item, stageIndexOverride = null) {
  if (!item) {
    currentCase.innerHTML = 'No active request selected.';
    ticketStatePanel.innerHTML = 'No current ticket state.';
    workflowActivityPanel.innerHTML = 'No workflow activity.';
    flowPipeline.innerHTML = '';
    return;
  }

  const model = workflowModel(item);
  const stageIndex = stageIndexOverride ?? getStageIndex(item);
  const currentStage = model.stages[stageIndex]?.label || 'Unknown Stage';
  const nextStage = model.stages[stageIndex + 1]?.label || 'Workflow complete';

  currentCase.innerHTML = `
    <h2>Current Focus</h2>
    <div class="focus-title">${item.input}</div>
    <p class="muted">This request is stepping through each workflow process one phase at a time.</p>
    <div class="meta">
      <span class="tag">owner: ${item.actualOwner}</span>
      <span class="tag ${statusTag(item.status)}">${item.status}</span>
      <span class="tag">class: ${item.actualClassification}</span>
    </div>
  `;

  ticketStatePanel.innerHTML = `
    <h2>Current Ticket State</h2>
    <div class="detail-grid">
      <div class="detail-box"><div class="label">Current Status</div><div>${item.status}</div></div>
      <div class="detail-box"><div class="label">Current Owner</div><div>${item.actualOwner}</div></div>
      <div class="detail-box"><div class="label">Current Step</div><div>${currentStage}</div></div>
      <div class="detail-box"><div class="label">Next Step</div><div>${nextStage}</div></div>
    </div>
  `;

  workflowActivityPanel.innerHTML = `
    <h2>Workflow Activity</h2>
    <div class="history-entry">
      <strong>Active Phase</strong>
      <div class="meta"><span class="tag">${currentStage}</span></div>
    </div>
    <div class="history-entry">
      <strong>Up Next</strong>
      <div class="meta"><span class="tag">${nextStage}</span></div>
    </div>
    ${(item.trace || []).slice(-3).map((entry) => `
      <div class="history-entry">
        <strong>${entry.type}</strong>
        <div class="meta"><span class="tag">actor: ${entry.actor}</span></div>
      </div>
    `).join('')}
  `;

  renderFlow(item, stageIndex);
}

function renderInspector(item) {
  if (!item) {
    requestSummary.innerHTML = 'Select a request to inspect workflow detail.';
    workflowState.innerHTML = 'No workflow state selected.';
    traceDetail.innerHTML = 'No trace events available.';
    artifactSummary.innerHTML = 'No artifact selected.';
    dataObjectsPanel.innerHTML = 'Select a request to inspect the underlying objects.';
    return;
  }

  const latestApproval = (item.approvals || [])[0] || null;
  const latestArtifact = item.artifact || null;
  const nextStep = item.status === 'awaiting-approval'
    ? 'Waiting for an approval decision before work can continue.'
    : item.status === 'blocked'
      ? 'Blocked until a human changes or reopens the request.'
      : 'Continue normal workflow progression under the current owner.';

  requestSummary.innerHTML = `
    <p>${item.input}</p>
    <div class="detail-grid">
      <div class="detail-box"><div class="label">Request ID</div><div>${item.id}</div></div>
      <div class="detail-box"><div class="label">Source</div><div>${item.source || 'unknown'}</div></div>
      <div class="detail-box"><div class="label">Classification</div><div>${item.actualClassification}</div></div>
      <div class="detail-box"><div class="label">Current Owner</div><div>${item.actualOwner}</div></div>
      <div class="detail-box"><div class="label">Status</div><div>${item.status}</div></div>
      <div class="detail-box"><div class="label">Trace Events</div><div>${item.traceCount || 0}</div></div>
    </div>
  `;

  workflowState.innerHTML = `
    <div class="detail-grid">
      <div class="detail-box"><div class="label">Current State</div><div>${item.status}</div></div>
      <div class="detail-box"><div class="label">Pending Approval</div><div>${latestApproval && latestApproval.status === 'pending' ? 'Yes' : 'No'}</div></div>
      <div class="detail-box"><div class="label">Blocker</div><div>${item.status === 'awaiting-approval' ? 'Approval required' : item.status === 'blocked' ? 'Request blocked' : 'None'}</div></div>
      <div class="detail-box"><div class="label">Next Step</div><div>${nextStep}</div></div>
    </div>
  `;

  const trace = item.trace || [];
  traceDetail.innerHTML = trace.length ? trace.map((entry) => {
    const kind = entry.type.includes('approval') ? 'approval' : entry.type.includes('blocked') ? 'blocked' : entry.type.includes('resolved') ? 'resolved' : '';
    return `
      <div class="timeline-entry ${kind}">
        <strong>${entry.type}</strong>
        <div class="meta">
          <span class="tag">actor: ${entry.actor}</span>
          <span class="tag">time: ${new Date(entry.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>
    `;
  }).join('') : '<p>No trace events available.</p>';

  artifactSummary.innerHTML = latestArtifact ? `
    <div class="artifact-row">
      <strong>${latestArtifact.type}</strong>
      <div class="meta">
        <span class="tag">owner: ${latestArtifact.owner}</span>
        <span class="tag">created: ${new Date(latestArtifact.createdAt).toLocaleTimeString()}</span>
      </div>
    </div>
  ` : '<p>No artifacts linked to this request yet.</p>';

  dataObjectsPanel.innerHTML = `
    <details class="raw-object">
      <summary class="raw-summary">Request Object JSON</summary>
      <pre class="raw-json">${escapeHtml(JSON.stringify(item, null, 2))}</pre>
    </details>
    <details class="raw-object">
      <summary class="raw-summary">Approval Object JSON</summary>
      <pre class="raw-json">${escapeHtml(JSON.stringify(latestApproval, null, 2))}</pre>
    </details>
    <details class="raw-object">
      <summary class="raw-summary">Artifact Object JSON</summary>
      <pre class="raw-json">${escapeHtml(JSON.stringify(latestArtifact, null, 2))}</pre>
    </details>
    <details class="raw-object">
      <summary class="raw-summary">Trace Payload JSON</summary>
      <pre class="raw-json">${escapeHtml(JSON.stringify(trace, null, 2))}</pre>
    </details>
  `;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function movePulseToNode(node) {
  if (!node) return;
  const wrapRect = topologyWrap.getBoundingClientRect();
  const rect = node.getBoundingClientRect();
  pulseDot.style.left = `${rect.left - wrapRect.left + rect.width / 2 - 6}px`;
  pulseDot.style.top = `${rect.top - wrapRect.top + rect.height / 2 - 6}px`;
  pulseDot.style.opacity = 1;
}

async function animateStage(item, stageIndex) {
  clearActive();
  const { stages } = workflowModel(item);
  const stage = stages[stageIndex];
  if (!stage?.nodeId) return;
  const node = document.querySelector(`[data-node="${stage.nodeId}"]`);
  if (!node) return;
  node.classList.add('active');
  node.classList.add('processing');
  movePulseToNode(node);
  await new Promise((resolve) => setTimeout(resolve, 320));
  node.classList.remove('processing');
}

async function renderActive(item, stageIndexOverride = null) {
  selectedRequestId = item.id;
  const stageIndex = stageIndexOverride ?? getStageIndex(item);
  renderVisualState(item, stageIndex);
  renderInspector(item);
  renderApprovals();
  renderAgentStatus();
  await animateStage(item, stageIndex);
  const alreadySeen = history.some((entry) => entry.id === item.id);
  if (!alreadySeen) {
    history = [item, ...history].slice(0, 8);
    renderHistory();
  }
  highlightSelectedRequest();
}

function highlightSelectedRequest() {
  document.querySelectorAll('.request-card').forEach((card) => {
    card.classList.toggle('selected', card.dataset.requestId === selectedRequestId);
  });
}

function runtimeSummaryData() {
  return {
    totalRequests: cases.length,
    totalArtifacts: cases.filter((item) => item.artifact).length,
    awaitingApproval: approvals.filter((a) => a.status === 'pending').length,
  };
}

function renderRuntimeStrip(data) {
  const selected = cases.find((item) => item.id === selectedRequestId) || cases[0];
  const stageInfo = selected ? workflowModel(selected) : null;
  const stageIndex = selected ? getStageIndex(selected) : null;
  runtimeStrip.innerHTML = `
    <div class="meta">
      <span class="tag">mode: ${currentMode === 'visual' ? 'visual playback' : 'inspection'}</span>
      <span class="tag">playback: ${playbackPaused ? 'paused' : 'running'}</span>
      <span class="tag">requests: ${data.summary.totalRequests}</span>
      <span class="tag">pending approvals: ${data.summary.awaitingApproval}</span>
      <span class="tag">artifacts: ${data.summary.totalArtifacts}</span>
      ${selected ? `<span class="tag">focus: ${selected.actualClassification} -> ${selected.actualOwner}</span>` : ''}
      ${selected && stageInfo ? `<span class="tag">stage ${stageIndex + 1}/${stageInfo.stages.length}</span>` : ''}
    </div>
    <p class="muted" style="margin-top:12px; margin-bottom:0;">Playback now advances process-by-process inside each request before moving to the next one.</p>
  `;
}

function applyRuntimeData(data, { preserveHistory = false } = {}) {
  cases = data.requests;
  approvals = data.approvals || [];
  if (!preserveHistory) history = [];
  renderHistory();
  renderQueue();

  summary.innerHTML = `
    <div class="summary-card"><div class="label">Requests</div><div class="value">${data.summary.totalRequests}</div></div>
    <div class="summary-card"><div class="label">Artifacts</div><div class="value">${data.summary.totalArtifacts}</div></div>
    <div class="summary-card"><div class="label">Awaiting Approval</div><div class="value">${data.summary.awaitingApproval}</div></div>
  `;

  const cardsHtml = data.requests.map((item) => `
    <article class="card request-card" data-request-id="${item.id}">
      <h3>${item.input}</h3>
      <div class="meta">
        <span class="tag">${item.actualClassification}</span>
        <span class="tag">${item.actualOwner}</span>
        <span class="tag ${statusTag(item.status)}">${item.status}</span>
      </div>
    </article>
  `).join('');
  results.innerHTML = cardsHtml;
  inspectorRequestList.innerHTML = cardsHtml;

  const selected = cases.find((item) => item.id === selectedRequestId) || cases[0] || null;
  if (selected) {
    if (!stageIndexByRequest.has(selected.id)) setStageIndex(selected, workflowModel(selected).currentIndex);
    renderVisualState(selected, getStageIndex(selected));
    renderInspector(selected);
    renderApprovals();
    renderAgentStatus();
  }
  renderRuntimeStrip(data);
  highlightSelectedRequest();
}

async function stepWorkflow() {
  if (!cases.length || autoAdvanceBusy) return;
  autoAdvanceBusy = true;
  const item = cases[activeIndex];
  const model = workflowModel(item);
  const currentStageIndex = getStageIndex(item);
  await renderActive(item, currentStageIndex);

  if (currentStageIndex < model.stages.length - 1) {
    setStageIndex(item, currentStageIndex + 1);
  } else {
    setStageIndex(item, 0);
    activeIndex = (activeIndex + 1) % cases.length;
    const nextItem = cases[activeIndex];
    if (nextItem && !stageIndexByRequest.has(nextItem.id)) {
      setStageIndex(nextItem, 0);
    }
  }

  renderRuntimeStrip({ summary: runtimeSummaryData() });
  autoAdvanceBusy = false;
}

function schedulePlayback() {
  if (playbackTimer) clearTimeout(playbackTimer);
  if (playbackPaused || !cases.length) return;
  playbackTimer = setTimeout(async function tick() {
    await stepWorkflow();
    schedulePlayback();
  }, 1800);
}

function pausePlayback() {
  playbackPaused = true;
  if (playbackTimer) clearTimeout(playbackTimer);
  renderRuntimeStrip({ summary: runtimeSummaryData() });
}

function resumePlayback() {
  if (!playbackPaused) return;
  playbackPaused = false;
  schedulePlayback();
  renderRuntimeStrip({ summary: runtimeSummaryData() });
}

async function load({ reset = false } = {}) {
  if (reset) {
    await fetch('/api/runtime/reset-from-tests', { method: 'POST' });
    stageIndexByRequest = new Map();
  }

  const res = await fetch('/api/runtime');
  const data = await res.json();
  applyRuntimeData(data);
  activeIndex = 0;
  schedulePlayback();
}

function connectEventStream() {
  const source = new EventSource('/api/events/stream');
  source.addEventListener('snapshot', (event) => {
    const data = JSON.parse(event.data);
    applyRuntimeData(data);
  });
  source.addEventListener('runtime.reset', (event) => {
    const data = JSON.parse(event.data);
    stageIndexByRequest = new Map();
    applyRuntimeData(data);
  });
  source.addEventListener('approval.updated', (event) => {
    const data = JSON.parse(event.data);
    applyRuntimeData(data, { preserveHistory: true });
  });
}

approvalsList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = button.dataset.id;
  const action = button.dataset.action;
  await fetch(`/api/runtime/approvals/${id}/${action}`, { method: 'POST' });
});

document.addEventListener('click', (event) => {
  const card = event.target.closest('[data-request-id]');
  if (!card) return;
  const item = cases.find((entry) => entry.id === card.dataset.requestId);
  if (item) {
    if (!stageIndexByRequest.has(item.id)) setStageIndex(item, 0);
    if (card.closest('#inspectionModeView')) setMode('inspect');
    pausePlayback();
    selectedRequestId = item.id;
    activeIndex = cases.findIndex((entry) => entry.id === item.id);
    renderActive(item, getStageIndex(item));
  }
});

modeVisualBtn.addEventListener('click', () => {
  setMode('visual');
  renderRuntimeStrip({ summary: runtimeSummaryData() });
});
modeInspectBtn.addEventListener('click', () => {
  setMode('inspect');
  renderRuntimeStrip({ summary: runtimeSummaryData() });
});
pauseBtn.addEventListener('click', pausePlayback);
resumeBtn.addEventListener('click', resumePlayback);
stepBtn.addEventListener('click', async () => {
  pausePlayback();
  await stepWorkflow();
});
refreshBtn.addEventListener('click', () => load({ reset: true }));
connectEventStream();
setMode('visual');
load();
