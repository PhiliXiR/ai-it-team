const summary = document.getElementById('summary');
const results = document.getElementById('results');
const refreshBtn = document.getElementById('refreshBtn');
const currentCase = document.getElementById('currentCase');
const historyList = document.getElementById('historyList');
const queueList = document.getElementById('queueList');
const approvalsList = document.getElementById('approvalsList');
const artifactPanel = document.getElementById('artifactPanel');
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
      <div class="meta"><span class="tag">playing</span></div>
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
    await new Promise((resolve) => setTimeout(resolve, 520));
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
  await animateRoute(item.route || []);
}

function enqueueScenario(item) {
  queue = [{ input: item.input }];
  renderQueue();
}

function completeScenario(item) {
  queue = [];
  renderQueue();
  history = [item, ...history.filter((entry) => entry.id !== item.id)].slice(0, 8);
  renderHistory();
}

function startPlayback() {
  if (intervalId) clearInterval(intervalId);
  if (!cases.length) return;

  const playNext = async () => {
    const item = cases[activeIndex];
    enqueueScenario(item);
    await new Promise((resolve) => setTimeout(resolve, 420));
    await renderActive(item);
    completeScenario(item);
    activeIndex = (activeIndex + 1) % cases.length;
  };

  playNext();
  intervalId = setInterval(playNext, 3400);
}

async function load({ reset = false } = {}) {
  if (reset) {
    await fetch('/api/runtime/reset-from-tests', { method: 'POST' });
  }

  const res = await fetch('/api/runtime');
  const data = await res.json();
  cases = data.requests;
  approvals = data.approvals || [];
  history = [];
  queue = [];
  renderHistory();
  renderQueue();
  renderApprovals();

  summary.innerHTML = `
    <div class="summary-card"><div class="label">Requests</div><div class="value">${data.summary.totalRequests}</div></div>
    <div class="summary-card"><div class="label">Artifacts</div><div class="value">${data.summary.totalArtifacts}</div></div>
    <div class="summary-card"><div class="label">Awaiting Approval</div><div class="value">${data.summary.awaitingApproval}</div></div>
  `;

  results.innerHTML = data.requests.map((item) => `
    <article class="card">
      <h2>${item.input}</h2>
      <div class="meta">
        <span class="tag">class: ${item.actualClassification}</span>
        <span class="tag">owner: ${item.actualOwner}</span>
        <span class="tag">status: ${item.status}</span>
        <span class="tag">trace events: ${item.traceCount || 0}</span>
      </div>
    </article>
  `).join('');

  activeIndex = 0;
  startPlayback();
}

approvalsList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = button.dataset.id;
  const action = button.dataset.action;
  await fetch(`/api/runtime/approvals/${id}/${action}`, { method: 'POST' });
  await load();
});

refreshBtn.addEventListener('click', () => load({ reset: true }));
load();
