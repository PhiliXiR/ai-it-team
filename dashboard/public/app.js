const summary = document.getElementById('summary');
const results = document.getElementById('results');
const refreshBtn = document.getElementById('refreshBtn');
const classifyBtn = document.getElementById('classifyBtn');
const requestInput = document.getElementById('requestInput');
const currentCase = document.getElementById('currentCase');
const historyList = document.getElementById('historyList');
const queueList = document.getElementById('queueList');
const artifactPanel = document.getElementById('artifactPanel');
let cases = [];
let activeIndex = 0;
let intervalId;
let history = [];
let queue = [];

function clearActive() {
  document.querySelectorAll('.node.active').forEach((el) => el.classList.remove('active'));
}

function renderHistory() {
  historyList.innerHTML = history.map((item) => `
    <div class="history-entry">
      <strong>${item.input}</strong>
      <div class="meta">
        <span class="tag">class: ${item.actualClassification || item.classification}</span>
        <span class="tag">owner: ${item.actualOwner || item.owner}</span>
      </div>
    </div>
  `).join('');
}

function renderQueue() {
  queueList.innerHTML = queue.map((item) => `
    <div class="queue-entry">
      <strong>${item.input}</strong>
      <div class="meta"><span class="tag">pending</span></div>
    </div>
  `).join('');
}

function renderArtifacts(item) {
  artifactPanel.innerHTML = `
    <h2>Generated Artifact</h2>
    <p><strong>Type:</strong> ${item.actualClassification || item.classification} summary</p>
    <p><strong>Owner:</strong> ${item.actualOwner || item.owner}</p>
    <p><strong>Suggested output:</strong> ${artifactLabel(item)}</p>
  `;
}

function artifactLabel(item) {
  const classification = item.actualClassification || item.classification;
  if (classification === 'support-issue') return 'triage summary';
  if (classification === 'access-request') return 'access review note';
  if (classification === 'incident') return 'incident summary';
  if (classification === 'infrastructure-change') return 'change plan';
  return 'routing note';
}

function renderActive(item, title = 'Active Scenario') {
  clearActive();
  (item.route || []).forEach((nodeId) => {
    const node = document.querySelector(`[data-node="${nodeId}"]`);
    if (node) node.classList.add('active');
  });

  currentCase.innerHTML = `
    <h2>${title}</h2>
    <p>${item.input}</p>
    <div class="meta">
      <span class="tag">class: ${item.actualClassification || item.classification}</span>
      <span class="tag">owner: ${item.actualOwner || item.owner}</span>
      ${item.pass !== undefined ? `<span class="tag ${item.pass ? 'pass' : 'fail'}">${item.pass ? 'PASS' : 'FAIL'}</span>` : ''}
    </div>
    <div class="meta">
      ${((item.escalation || []).map((e) => `<span class="tag">escalate: ${e}</span>`).join('')) || '<span class="tag">no escalation</span>'}
    </div>
  `;

  renderArtifacts(item);
}

function startPlayback() {
  if (intervalId) clearInterval(intervalId);
  if (!cases.length) return;
  renderActive(cases[activeIndex]);
  intervalId = setInterval(() => {
    activeIndex = (activeIndex + 1) % cases.length;
    renderActive(cases[activeIndex]);
  }, 2600);
}

async function load() {
  const res = await fetch('/api/tests');
  const data = await res.json();
  cases = data.results;

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

async function classifyManualRequest() {
  const input = requestInput.value.trim();
  if (!input) return;
  const pending = { input };
  queue.unshift(pending);
  queue = queue.slice(0, 8);
  renderQueue();

  const res = await fetch('/api/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input })
  });
  const data = await res.json();
  const item = { ...data, input };
  history.unshift(item);
  history = history.slice(0, 8);
  queue = queue.filter((entry) => entry !== pending);
  renderQueue();
  renderHistory();
  if (intervalId) clearInterval(intervalId);
  renderActive(item, 'Manual Request');
}

refreshBtn.addEventListener('click', load);
classifyBtn.addEventListener('click', classifyManualRequest);
load();
