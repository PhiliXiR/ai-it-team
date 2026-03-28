const summary = document.getElementById('summary');
const results = document.getElementById('results');
const refreshBtn = document.getElementById('refreshBtn');
const currentCase = document.getElementById('currentCase');
const historyList = document.getElementById('historyList');
const queueList = document.getElementById('queueList');
const approvalsList = document.getElementById('approvalsList');
const agentStatusList = document.getElementById('agentStatusList');
const artifactPanel = document.getElementById('artifactPanel');
const traceDetail = document.getElementById('traceDetail');
const pulseDot = document.getElementById('pulseDot');
const topologyWrap = document.getElementById('topologyWrap');
let cases = [];
let approvals = [];
let activeIndex = 0;
let intervalId;
let history = [];
let queue = [];

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
        <span class="tag">class: ${item.actualClassification}</span>
        <span class="tag">owner: ${item.actualOwner}</span>
        <span class="tag">status: ${item.status}</span>
      </div>
    </div>
  `).join('');
}

function renderQueue() {
  queueList.innerHTML = queue.map((item) => `
    <div class="queue-entry pending">
      <strong>${item.input}</strong>
      <div class="meta"><span class="tag">live</span></div>
    </div>
  `).join('');
}

function renderApprovals() {
  const pending = approvals.filter((item) => item.status === 'pending');
  approvalsList.innerHTML = pending.length ? pending.map((item) => `
    <div class="history-entry">
      <strong>${item.type}</strong>
      <div class="meta">
        <span class="tag">requested by: ${item.requestedBy}</span>
        <span class="tag">approver: ${item.requiredApproverRole}</span>
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

function renderArtifacts(item) {
  const artifactType = item.artifact?.type || `${item.actualClassification} summary`;
  artifactPanel.innerHTML = `
    <h2>Generated Artifact</h2>
    <p><strong>Type:</strong> ${artifactType}</p>
    <p><strong>Owner:</strong> ${item.actualOwner}</p>
    <p><strong>Trace events:</strong> ${item.traceCount || 0}</p>
    <p><strong>Approvals:</strong> ${(item.approvals || []).length}</p>
  `;
}

function renderTrace(item) {
  const trace = item.trace || [];
  traceDetail.innerHTML = trace.length ? trace.map((entry) => `
    <div class="history-entry">
      <strong>${entry.type}</strong>
      <div class="meta">
        <span class="tag">actor: ${entry.actor}</span>
        <span class="tag">time: ${new Date(entry.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  `).join('') : '<p>No trace events available.</p>';
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

async function renderActive(item, title = 'Active Request') {
  currentCase.innerHTML = `
    <h2>${title}</h2>
    <p>${item.input}</p>
    <div class="meta">
      <span class="tag">class: ${item.actualClassification}</span>
      <span class="tag">owner: ${item.actualOwner}</span>
      <span class="tag">status: ${item.status}</span>
    </div>
    <div class="meta">
      ${((item.escalation || []).map((e) => `<span class="tag">escalate: ${e}</span>`).join('')) || '<span class="tag">no escalation</span>'}
    </div>
  `;

  renderArtifacts(item);
  renderTrace(item);
  queue = [{ input: item.input }];
  renderQueue();
  await animateRoute(item.route || []);
  queue = [];
  renderQueue();
  history = [item, ...history.filter((entry) => entry.id !== item.id)].slice(0, 8);
  renderHistory();
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
        <span class="tag">class: ${item.actualClassification}</span>
        <span class="tag">owner: ${item.actualOwner}</span>
        <span class="tag">status: ${item.status}</span>
        <span class="tag">trace events: ${item.traceCount || 0}</span>
      </div>
    </article>
  `).join('');
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
  if (item) renderActive(item, 'Selected Request');
});

refreshBtn.addEventListener('click', () => load({ reset: true }));
connectEventStream();
load();
