const summary = document.getElementById('summary');
const results = document.getElementById('results');
const refreshBtn = document.getElementById('refreshBtn');
const currentCase = document.getElementById('currentCase');
let cases = [];
let activeIndex = 0;
let intervalId;

function clearActive() {
  document.querySelectorAll('.node.active').forEach((el) => el.classList.remove('active'));
}

function showCase(index) {
  const item = cases[index];
  if (!item) return;
  clearActive();
  item.route.forEach((nodeId) => {
    const node = document.querySelector(`[data-node="${nodeId}"]`);
    if (node) node.classList.add('active');
  });

  currentCase.innerHTML = `
    <h2>Active Scenario</h2>
    <p>${item.input}</p>
    <div class="meta">
      <span class="tag">class: ${item.actualClassification}</span>
      <span class="tag">owner: ${item.actualOwner}</span>
      <span class="tag ${item.pass ? 'pass' : 'fail'}">${item.pass ? 'PASS' : 'FAIL'}</span>
    </div>
  `;
}

function startPlayback() {
  if (intervalId) clearInterval(intervalId);
  showCase(activeIndex);
  intervalId = setInterval(() => {
    activeIndex = (activeIndex + 1) % cases.length;
    showCase(activeIndex);
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

refreshBtn.addEventListener('click', load);
load();
