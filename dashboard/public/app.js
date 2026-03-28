const summary = document.getElementById('summary');
const results = document.getElementById('results');
const refreshBtn = document.getElementById('refreshBtn');

async function load() {
  const res = await fetch('/api/tests');
  const data = await res.json();

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
      <div class="meta">
        ${(item.escalation || []).map((e) => `<span class="tag">escalate: ${e}</span>`).join('')}
      </div>
    </article>
  `).join('');
}

refreshBtn.addEventListener('click', load);
load();
