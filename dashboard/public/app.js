const summary = document.getElementById('summary');
const results = document.getElementById('results');
const refreshBtn = document.getElementById('refreshBtn');
const currentCase = document.getElementById('currentCase');
const historyList = document.getElementById('historyList');
const queueList = document.getElementById('queueList');
const artifactPanel = document.getElementById('artifactPanel');
const pulseDot = document.getElementById('pulseDot');
const topologyWrap = document.getElementById('topologyWrap');
let cases = [];
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
      </div>
    </div>
  `).join('');
}

function renderQueue() {
  queueList.innerHTML = queue.map((item) => `
    <div class="queue-entry pending">
      <strong>${item.input}</strong>
      <div class="meta"><span class="tag">pending</span></div>
    </div>
  `).join('');
}

function renderArtifacts(item) {
  artifactPanel.innerHTML = `
    <h2>Generated Artifact</h2>
    <p><strong>Type:</strong> ${item.actualClassification} summary</p>
    <p><strong>Owner:</strong> ${item.actualOwner}</p>
    <p><strong>Suggested output:</strong> ${artifactLabel(item)}</p>
  `;
}

function artifactLabel(item) {
  if (item.actualClassification === 'support-issue') return 'triage summary';
  if (item.actualClassification === 'access-request') return 'access review note';
  if (item.actualClassification === 'incident') return 'incident summary';
  if (item.actualClassification === 'infrastructure-change') return 'change plan';
  return 'routing note';
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

async function renderActive(item, title = 'Active Scenario') {
  currentCase.innerHTML = `
    <h2>${title}</h2>
    <p>${item.input}</p>
    <div class="meta">
      <span class="tag">class: ${item.actualClassification}</span>
      <span class="tag">owner: ${item.actualOwner}</span>
      <span class="tag ${item.pass ? 'pass' : 'fail'}">${item.pass ? 'PASS' : 'FAIL'}</span>
    </div>
    <div class="meta">
      ${((item.escalation || []).map((e) => `<span class="tag">escalate: ${e}</span>`).join('')) || '<span class="tag">no escalation</span>'}
    </div>
  `;

  renderArtifacts(item);
  await animateRoute(item.route || []);
}

function enqueueScenario(item) {
  queue.unshift({ input: item.input });
  queue = queue.slice(0, 6);
  renderQueue();
}

function completeScenario(item) {
  queue = queue.filter((entry) => entry.input !== item.input);
  renderQueue();
  history.unshift(item);
  history = history.slice(0, 8);
  renderHistory();
}

function startPlayback() {
  if (intervalId) clearInterval(intervalId);
  if (!cases.length) return;

  const playNext = async () => {
    const item = cases[activeIndex];
    enqueueScenario(item);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await renderActive(item);
    completeScenario(item);
    activeIndex = (activeIndex + 1) % cases.length;
  };

  playNext();
  intervalId = setInterval(playNext, 3600);
}

async function load() {
  const res = await fetch('/api/tests');
  const data = await res.json();
  cases = data.results;
  history = [];
  queue = [];
  renderHistory();
  renderQueue();

  summary.innerHTML = `
    <div class="summary-card"><div class="label">Passed</div><div class="value">${data.passed}</div></div>
    <div class="summary-card"><div class="label">Total</div><div class="value">${data.total}</div></div>
    <div class="summary-card"><div class="label">Status</div><div class="value">${data.passed === data.total ? 'Healthy' : 'Needs work'}</div></div>
  `;

  results.innerHTML = data.results.map((item) => `
    <article class="card">
      <h2>${item.input}</h2>
      <div class="meta">
        <span class="tag">expected class: ${item.expectedClassification}</span>
        <span class="tag">actual class: ${item.actualClassification}</span>
        <span class="tag">expected owner: ${item.expectedOwner}</span>
        <span class="tag">actual owner: ${item.actualOwner}</span>
        <span class="tag ${item.pass ? 'pass' : 'fail'}">${item.pass ? 'PASS' : 'FAIL'}</span>
      </div>
    </article>
  `).join('');

  activeIndex = 0;
  startPlayback();
}

refreshBtn.addEventListener('click', load);
load();
