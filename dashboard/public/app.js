const summary = document.getElementById('summary');
const results = document.getElementById('results');
const runtimeStrip = document.getElementById('runtimeStrip');
const refreshBtn = document.getElementById('refreshBtn');
const modeVisualBtn = document.getElementById('modeVisualBtn');
const modeInspectBtn = document.getElementById('modeInspectBtn');
const visualModeView = document.getElementById('visualModeView');
const inspectionModeView = document.getElementById('inspectionModeView');
const currentCase = document.getElementById('currentCase');
const historyList = document.getElementById('historyList');
const queueList = document.getElementById('queueList');
const approvalsList = document.getElementById('approvalsList');
const agentStatusList = document.getElementById('agentStatusList');
const requestDetail = document.getElementById('requestDetail');
const traceDetail = document.getElementById('traceDetail');
const pulseDot = document.getElementById('pulseDot');
const topologyWrap = document.getElementById('topologyWrap');
let cases = [];
let approvals = [];
let activeIndex = 0;
let intervalId;
let history = [];
let queue = [];
let currentMode = 'visual';
let selectedRequestId = null;

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
  queueList.innerHTML = queue.length
    ? queue.map((item) => `
      <div class="queue-entry pending">
        <strong>Now processing</strong>
        <div>${item.input}</div>
      </div>
    `).join('')
    : '<p class="muted">Playback queue is idle between request transitions.</p>';
}

function renderApprovals() {
  const pending = approvals.filter((item) => item.status === 'pending');
  approvalsList.innerHTML = pending.length ? pending.map((item) => `
    <div class="history-entry">
      <strong>${item.type}</strong>
      <div class="meta">
        <span class="tag">requested by: ${item.requestedBy}</span>
        <span class="tag">approver: ${item.requiredApproverRole}</span>
        <span class="tag status-awaiting-approval">pending</span>
      </div>
      <div class="meta">
        <button data-action="approve" data-id="${item.id}">Approve</button>
        <button data-action="reject" data-id="${item.id}">Reject</button>
      </div>
    </div>
  `).join('') : '<p>No pending approvals.</p>';
}

function renderAgentStatus() {
  const counts = new Map();
  for (const item of cases) {
    const key = item.actualOwner || 'unassigned';
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  agentStatusList.innerHTML = [...counts.entries()].map(([agent, count]) => `
    <div class="history-entry">
      <strong>${agent}</strong>
      <div class="meta">
        <span class="tag">active requests: ${count}</span>
      </div>
    </div>
  `).join('');
}

function renderRequestDetail(item) {
  if (!item) {
    currentCase.innerHTML = 'No active request selected.';
    requestDetail.innerHTML = 'Select a request to inspect workflow detail.';
    return;
  }

  currentCase.innerHTML = `
    <h2>Current Focus</h2>
    <p>${item.input}</p>
    <div class="meta">
      <span class="tag">owner: ${item.actualOwner}</span>
      <span class="tag ${statusTag(item.status)}">${item.status}</span>
    </div>
    <div class="meta">
      <span class="tag">class: ${item.actualClassification}</span>
      <span class="tag">trace: ${item.traceCount || 0}</span>
    </div>
  `;

  requestDetail.innerHTML = `
    <p>${item.input}</p>
    <div class="meta">
      <span class="tag">class: ${item.actualClassification}</span>
      <span class="tag">owner: ${item.actualOwner}</span>
      <span class="tag ${statusTag(item.status)}">status: ${item.status}</span>
    </div>
    <div class="detail-grid">
      <div class="detail-box">
        <div class="label">Request ID</div>
        <div>${item.id}</div>
      </div>
      <div class="detail-box">
        <div class="label">Source</div>
        <div>${item.source || 'unknown'}</div>
      </div>
      <div class="detail-box">
        <div class="label">Trace Events</div>
        <div>${item.traceCount || 0}</div>
      </div>
      <div class="detail-box">
        <div class="label">Approvals</div>
        <div>${(item.approvals || []).length}</div>
      </div>
    </div>
  `;
}

function renderTrace(item) {
  const trace = item?.trace || [];
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
}

function movePulseToNode(node) {
  if (!node) return;
  const wrapRect = topologyWrap.getBoundingClientRect();
  const rect = node.getBoundingClientRect();
  pulseDot.style.left = `${rect.left - wrapRect.left + rect.width / 2 - 6}px`;
  pulseDot.style.top = `${rect.top - wrapRect.top + rect.height / 2 - 6}px`;
  pulseDot.style.opacity = 1;
}

async function animateRoute(route) {
  clearActive();
  for (const nodeId of route || []) {
    const node = document.querySelector(`[data-node="${nodeId}"]`);
    if (!node) continue;
    node.classList.add('active');
    node.classList.add('processing');
    movePulseToNode(node);
    await new Promise((resolve) => setTimeout(resolve, 420));
    node.classList.remove('processing');
  }
}

async function renderActive(item) {
  selectedRequestId = item.id;
  renderRequestDetail(item);
  renderTrace(item);
  queue = [{ input: item.input }];
  renderQueue();
  await animateRoute(item.route || []);
  queue = [];
  renderQueue();
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

function renderRuntimeStrip(data) {
  const selected = cases.find((item) => item.id === selectedRequestId) || cases[0];
  runtimeStrip.innerHTML = `
    <div class="meta">
      <span class="tag">mode: ${currentMode === 'visual' ? 'visual playback' : 'inspection'}</span>
      <span class="tag">requests: ${data.summary.totalRequests}</span>
      <span class="tag">pending approvals: ${data.summary.awaitingApproval}</span>
      <span class="tag">artifacts: ${data.summary.totalArtifacts}</span>
      ${selected ? `<span class="tag">focus: ${selected.actualClassification} -> ${selected.actualOwner}</span>` : ''}
    </div>
    <p class="muted" style="margin-top:12px; margin-bottom:0;">This dashboard is currently showing seeded demo/runtime state with live updates layered on top.</p>
  `;
}

function applyRuntimeData(data, { preserveHistory = false } = {}) {
  cases = data.requests;
  approvals = data.approvals || [];
  if (!preserveHistory) history = [];
  queue = [];
  renderHistory();
  renderQueue();
  renderApprovals();
  renderAgentStatus();

  summary.innerHTML = `
    <div class="summary-card"><div class="label">Requests</div><div class="value">${data.summary.totalRequests}</div></div>
    <div class="summary-card"><div class="label">Artifacts</div><div class="value">${data.summary.totalArtifacts}</div></div>
    <div class="summary-card"><div class="label">Awaiting Approval</div><div class="value">${data.summary.awaitingApproval}</div></div>
  `;

  results.innerHTML = data.requests.map((item) => `
    <article class="card request-card" data-request-id="${item.id}">
      <h2>${item.input}</h2>
      <div class="meta">
        <span class="tag">${item.actualClassification}</span>
        <span class="tag">${item.actualOwner}</span>
        <span class="tag ${statusTag(item.status)}">${item.status}</span>
      </div>
    </article>
  `).join('');

  const selected = cases.find((item) => item.id === selectedRequestId) || cases[0] || null;
  renderRequestDetail(selected);
  renderTrace(selected);
  renderRuntimeStrip(data);
  highlightSelectedRequest();
}

function startPlayback() {
  if (intervalId) clearInterval(intervalId);
  if (!cases.length) return;

  const playNext = async () => {
    const item = cases[activeIndex];
    await renderActive(item);
    activeIndex = (activeIndex + 1) % cases.length;
  };

  playNext();
  intervalId = setInterval(playNext, 3600);
}

async function load({ reset = false } = {}) {
  if (reset) {
    await fetch('/api/runtime/reset-from-tests', { method: 'POST' });
  }

  const res = await fetch('/api/runtime');
  const data = await res.json();
  applyRuntimeData(data);
  activeIndex = 0;
  startPlayback();
}

function connectEventStream() {
  const source = new EventSource('/api/events/stream');
  source.addEventListener('snapshot', (event) => {
    const data = JSON.parse(event.data);
    applyRuntimeData(data);
  });
  source.addEventListener('runtime.reset', (event) => {
    const data = JSON.parse(event.data);
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

results.addEventListener('click', (event) => {
  const card = event.target.closest('[data-request-id]');
  if (!card) return;
  const item = cases.find((entry) => entry.id === card.dataset.requestId);
  if (item) {
    setMode('inspect');
    renderActive(item);
  }
});

modeVisualBtn.addEventListener('click', () => {
  setMode('visual');
  renderRuntimeStrip({ summary: { totalRequests: cases.length, totalArtifacts: cases.filter(Boolean).length, awaitingApproval: approvals.filter((a) => a.status === 'pending').length } });
});
modeInspectBtn.addEventListener('click', () => {
  setMode('inspect');
  renderRuntimeStrip({ summary: { totalRequests: cases.length, totalArtifacts: cases.filter(Boolean).length, awaitingApproval: approvals.filter((a) => a.status === 'pending').length } });
});
refreshBtn.addEventListener('click', () => load({ reset: true }));
connectEventStream();
setMode('visual');
load();
