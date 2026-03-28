const summary = document.getElementById('summary');
const results = document.getElementById('results');
const inspectorRequestList = document.getElementById('inspectorRequestList');
const runtimeStrip = document.getElementById('runtimeStrip');
const refreshBtn = document.getElementById('refreshBtn');
const backBtn = document.getElementById('backBtn');
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
const phaseTimelinePanel = document.getElementById('phaseTimelinePanel');
const humanInvolvementPanel = document.getElementById('humanInvolvementPanel');
const executionTracePanel = document.getElementById('executionTracePanel');
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
let autoAdvanceBusy = false;
let timelineCursorByRequest = new Map();

function statusTag(status) {
  return `status-${status}`;
}

function prettifyNodeName(value = '') {
  return value.replaceAll('-', ' ').replaceAll('.', ' ');
}

function traceKind(entry) {
  const type = entry.type || '';
  if (type.includes('approval')) return 'approval';
  if (type.includes('blocked') || type.includes('intervention')) return 'blocked';
  if (type.includes('verification') || type.includes('passed') || type.includes('completed')) return 'resolved';
  return '';
}

function traceSummary(entry) {
  return entry?.data?.summary || prettifyNodeName(entry.type || 'event');
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

function deriveHumanEvents(item) {
  return item.humanEvents || [];
}

function deriveExecutionSteps(item) {
  return item.executionTrace || [];
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
    { label: 'Request Queue', type: 'queue', nodeId: null, message: 'Request enters the shared intake queue.' },
    { label: 'Helpdesk Lead', type: 'agent', nodeId: 'helpdesk-lead', message: 'Helpdesk classifies and frames the request.' },
    { label: ownerNode, type: 'owner', nodeId: item.actualOwner || null, message: `${ownerNode} takes ownership of the request.` },
    specialistNode && specialistNode !== ownerNode
      ? { label: specialistNode, type: 'specialist', nodeId: specialistNode.toLowerCase().replaceAll(' ', '-'), message: `${specialistNode} handles specialist workflow work.` }
      : null,
    approvalNode ? { label: 'Approval Gate', type: 'approval', nodeId: 'security-director', message: 'A human approval gate decides whether the workflow can continue.' } : null,
    { label: systemNode, type: 'system', nodeId: classification === 'support-issue' ? 'vpn-system' : classification === 'access-request' ? 'idp-system' : classification === 'incident' ? 'internal-app' : classification === 'infrastructure-change' ? 'firewall-system' : null, message: `${systemNode} is the main destination system for this workflow.` },
    { label: artifactNode, type: 'artifact', nodeId: null, message: 'The workflow produces an artifact or output record.' }
  ].filter(Boolean);

  return { stages };
}

function buildTimeline(item) {
  const { stages } = workflowModel(item);
  const executionSteps = deriveExecutionSteps(item);
  const humanEvents = deriveHumanEvents(item);
  const timeline = [];

  for (const stage of stages) {
    timeline.push({ kind: 'stage', stageType: stage.type, label: stage.label, nodeId: stage.nodeId, message: stage.message });

    if (stage.type === 'approval') {
      for (const event of humanEvents) {
        timeline.push({ kind: 'human', stageType: stage.type, label: event.title, state: event.state, message: event.summary || event.detail, nodeId: 'security-director' });
      }
    }

    if (stage.type === 'system') {
      for (const step of executionSteps) {
        timeline.push({ kind: 'execution', stageType: stage.type, label: prettifyNodeName(step.action || step.title), message: step.detail, nodeId: stage.nodeId });
      }
    }
  }

  return timeline;
}

function getTimelineCursor(item) {
  const timeline = buildTimeline(item);
  const saved = timelineCursorByRequest.get(item.id);
  if (typeof saved === 'number') return Math.max(0, Math.min(saved, Math.max(0, timeline.length - 1)));
  return 0;
}

function setTimelineCursor(item, index) {
  const timeline = buildTimeline(item);
  timelineCursorByRequest.set(item.id, Math.max(0, Math.min(index, Math.max(0, timeline.length - 1))));
}

function getCurrentTimelineEntry(item, cursor) {
  const timeline = buildTimeline(item);
  return timeline[cursor] || timeline[0] || null;
}

function getActiveStageIndex(item, cursor) {
  const timeline = buildTimeline(item);
  let stageIndex = -1;
  for (let i = 0; i <= cursor && i < timeline.length; i += 1) {
    if (timeline[i].kind === 'stage') stageIndex += 1;
  }
  return Math.max(stageIndex, 0);
}

function stageState(index, activeIndex) {
  if (index < activeIndex) return 'completed';
  if (index === activeIndex) return 'current';
  return 'upcoming';
}

function stageMetaText(state, step, isFinal) {
  if (state === 'completed') return 'completed';
  if (state === 'current') return isFinal ? 'active final phase' : 'active now';
  if (step.type === 'approval') return 'waiting if required';
  return 'waiting';
}

function renderFlow(item, cursor) {
  const { stages } = workflowModel(item);
  const stageIndex = getActiveStageIndex(item, cursor);
  flowPipeline.innerHTML = stages.map((step, index) => {
    const state = stageState(index, stageIndex);
    return `${index > 0 ? '<span class="flow-arrow">→</span>' : ''}
      <div class="flow-step ${state}">
        <div class="flow-step-label">${step.label}</div>
        <div class="flow-step-meta">${stageMetaText(state, step, index === stages.length - 1)}</div>
      </div>`;
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
  const recent = selected.trace?.slice(-4) || [];
  agentStatusList.innerHTML = `
    <div class="history-entry">
      <strong>Current Owner</strong>
      <div class="meta"><span class="tag">${selected.actualOwner}</span></div>
    </div>
    ${recent.map((entry) => `
      <div class="history-entry">
        <strong>${prettifyNodeName(entry.type)}</strong>
        <div class="meta"><span class="tag">${entry.actor}</span></div>
      </div>
    `).join('')}
  `;
}

function renderPhaseTimeline(item, cursor) {
  const timeline = buildTimeline(item);
  phaseTimelinePanel.innerHTML = `
    <h2>Phase Timeline</h2>
    <div class="phase-timeline">
      ${timeline.map((entry, index) => {
        const state = stageState(index, cursor);
        const detail = state === 'completed'
          ? `${entry.message} Finished.`
          : state === 'current'
            ? entry.message
            : `Up next: ${entry.message}`;
        return `
          <div class="phase-entry ${state}">
            <div class="phase-entry-title">${entry.label}</div>
            <div class="phase-entry-meta">${detail}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderHumanInvolvement(item, cursor) {
  const timeline = buildTimeline(item).filter((entry) => entry.kind === 'human');
  const completedCount = buildTimeline(item).slice(0, cursor + 1).filter((entry) => entry.kind === 'human').length - 1;
  humanInvolvementPanel.innerHTML = `
    <h2>Human Involvement</h2>
    <div class="human-list">
      ${timeline.map((event, index) => {
        const state = completedCount < 0 ? 'pending' : index < completedCount ? 'approved' : index === completedCount ? 'override' : 'pending';
        return `
          <div class="human-entry ${state}">
            <div class="human-entry-title">${event.label}</div>
            <div class="human-entry-meta">${event.message}</div>
          </div>
        `;
      }).join('') || '<p>No human-specific steps for this request.</p>'}
    </div>
  `;
}

function renderExecutionTrace(item, cursor) {
  const timeline = buildTimeline(item).filter((entry) => entry.kind === 'execution');
  const completedCount = buildTimeline(item).slice(0, cursor + 1).filter((entry) => entry.kind === 'execution').length - 1;
  executionTracePanel.innerHTML = `
    <h2>Execution Trace</h2>
    <div class="execution-list">
      ${timeline.map((step, index) => {
        const state = completedCount < 0 ? 'upcoming' : index < completedCount ? 'completed' : index === completedCount ? 'current' : 'upcoming';
        const detail = state === 'completed'
          ? `${step.message} Finished.`
          : state === 'current'
            ? `${step.message}`
            : `Next execution step: ${step.message}`;
        return `
          <div class="execution-entry ${state}">
            <div class="execution-entry-title">${step.label}</div>
            <div class="execution-entry-meta">${detail}</div>
          </div>
        `;
      }).join('') || '<p>No execution steps for this request.</p>'}
    </div>
  `;
}

function renderVisualState(item, cursor) {
  if (!item) {
    currentCase.innerHTML = 'No active request selected.';
    ticketStatePanel.innerHTML = 'No current ticket state.';
    workflowActivityPanel.innerHTML = 'No workflow activity.';
    phaseTimelinePanel.innerHTML = 'No phase timeline.';
    humanInvolvementPanel.innerHTML = 'No human involvement.';
    executionTracePanel.innerHTML = 'No execution trace.';
    flowPipeline.innerHTML = '';
    return;
  }

  const entry = getCurrentTimelineEntry(item, cursor);
  const stageIndex = getActiveStageIndex(item, cursor);
  const { stages } = workflowModel(item);
  const currentStage = stages[stageIndex]?.label || entry?.label || 'Unknown Step';
  const nextEntry = buildTimeline(item)[cursor + 1];
  const nextStep = nextEntry?.label || 'Workflow complete';

  const activeKind = entry?.kind || 'step';
  const activeLabel = entry?.label || currentStage;
  const activeMessage = entry?.message || 'No timeline detail available.';

  currentCase.innerHTML = `
    <h2>Current Focus</h2>
    <div class="focus-title">${item.input}</div>
    <div class="meta">
      <span class="tag">now: ${activeLabel}</span>
      <span class="tag">type: ${activeKind}</span>
      <span class="tag">next: ${nextStep}</span>
    </div>
    <div class="meta">
      <span class="tag">owner: ${item.actualOwner}</span>
      <span class="tag ${statusTag(item.status)}">${item.status}</span>
      <span class="tag">class: ${item.actualClassification}</span>
    </div>
    <div class="meta">
      <span class="tag">${activeMessage}</span>
    </div>
  `;

  workflowActivityPanel.innerHTML = `
    <h2>Workflow Activity</h2>
    <div class="history-entry">
      <strong>${entry?.label || 'No current step'}</strong>
      <div class="meta">
        <span class="tag">${entry?.message || 'No detail available.'}</span>
        <span class="tag">kind: ${entry?.kind || 'n/a'}</span>
      </div>
    </div>
    ${(item.trace || []).slice(0, 3).map((trace) => `
      <div class="history-entry">
        <strong>${prettifyNodeName(trace.type)}</strong>
        <div class="meta">
          <span class="tag">${traceSummary(trace)}</span>
          <span class="tag">actor: ${trace.actor}</span>
        </div>
      </div>
    `).join('')}
  `;

  ticketStatePanel.innerHTML = `
    <h2>Current Ticket State</h2>
    <div class="detail-grid">
      <div class="detail-box"><div class="label">Current Status</div><div>${item.status}</div></div>
      <div class="detail-box"><div class="label">Current Owner</div><div>${item.actualOwner}</div></div>
      <div class="detail-box"><div class="label">Current Step</div><div>${activeLabel}</div></div>
      <div class="detail-box"><div class="label">Next Step</div><div>${nextStep}</div></div>
    </div>
    <div class="meta"><span class="tag">${activeMessage}</span></div>
  `;

  renderFlow(item, cursor);
  renderPhaseTimeline(item, cursor);
  renderHumanInvolvement(item, cursor);
  renderExecutionTrace(item, cursor);
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
    const kind = traceKind(entry);
    return `
      <div class="timeline-entry ${kind}">
        <strong>${prettifyNodeName(entry.type)}</strong>
        <div class="meta">
          <span class="tag">${traceSummary(entry)}</span>
          <span class="tag">actor: ${entry.actor}</span>
          ${entry.timestamp ? `<span class="tag">time: ${new Date(entry.timestamp).toLocaleTimeString()}</span>` : '<span class="tag">seeded scenario event</span>'}
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

async function animateCursor(item, cursor) {
  clearActive();
  const entry = getCurrentTimelineEntry(item, cursor);
  if (!entry?.nodeId) {
    await new Promise((resolve) => setTimeout(resolve, 140));
    return;
  }
  const node = document.querySelector(`[data-node="${entry.nodeId}"]`);
  if (!node) {
    await new Promise((resolve) => setTimeout(resolve, 140));
    return;
  }
  node.classList.add('active');
  node.classList.add('processing');
  movePulseToNode(node);
  await new Promise((resolve) => setTimeout(resolve, 260));
  node.classList.remove('processing');
}

async function renderActive(item, cursorOverride = null) {
  selectedRequestId = item.id;
  const cursor = cursorOverride ?? getTimelineCursor(item);
  renderVisualState(item, cursor);
  renderInspector(item);
  renderApprovals();
  renderAgentStatus();
  await animateCursor(item, cursor);
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
  const timeline = selected ? buildTimeline(selected) : [];
  const cursor = selected ? getTimelineCursor(selected) : null;
  runtimeStrip.innerHTML = `
    <div class="meta">
      <span class="tag">mode: ${currentMode === 'visual' ? 'visual playback' : 'inspection'}</span>
      <span class="tag">playback: ${playbackPaused ? 'paused' : 'running'}</span>
      <span class="tag">requests: ${data.summary.totalRequests}</span>
      <span class="tag">pending approvals: ${data.summary.awaitingApproval}</span>
      <span class="tag">artifacts: ${data.summary.totalArtifacts}</span>
      ${selected ? `<span class="tag">focus: ${selected.actualClassification} -> ${selected.actualOwner}</span>` : ''}
      ${selected && timeline.length ? `<span class="tag">timeline ${cursor + 1}/${timeline.length}</span>` : ''}
    </div>
    <p class="muted" style="margin-top:12px; margin-bottom:0;">Playback now runs on a reversible request timeline so workflow, human, and execution steps can be stepped forward and backward without skipping.</p>
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
    if (!timelineCursorByRequest.has(selected.id)) setTimelineCursor(selected, 0);
    renderVisualState(selected, getTimelineCursor(selected));
    renderInspector(selected);
    renderApprovals();
    renderAgentStatus();
  }
  renderRuntimeStrip(data);
  highlightSelectedRequest();
}

async function stepForward() {
  if (!cases.length || autoAdvanceBusy) return;
  autoAdvanceBusy = true;
  try {
    const item = cases[activeIndex];
    const timeline = buildTimeline(item);
    const cursor = getTimelineCursor(item);
    await renderActive(item, cursor);

    if (cursor < timeline.length - 1) {
      setTimelineCursor(item, cursor + 1);
    } else {
      setTimelineCursor(item, 0);
      activeIndex = (activeIndex + 1) % cases.length;
      const nextItem = cases[activeIndex];
      if (nextItem && !timelineCursorByRequest.has(nextItem.id)) {
        setTimelineCursor(nextItem, 0);
      }
    }

    renderRuntimeStrip({ summary: runtimeSummaryData() });
  } finally {
    autoAdvanceBusy = false;
  }
}

async function stepBackward() {
  if (!cases.length || autoAdvanceBusy) return;
  autoAdvanceBusy = true;
  try {
    const item = cases[activeIndex];
    let cursor = getTimelineCursor(item);
    if (cursor > 0) {
      setTimelineCursor(item, cursor - 1);
      cursor -= 1;
      await renderActive(item, cursor);
    } else {
      activeIndex = (activeIndex - 1 + cases.length) % cases.length;
      const previousItem = cases[activeIndex];
      const previousTimeline = buildTimeline(previousItem);
      setTimelineCursor(previousItem, Math.max(0, previousTimeline.length - 1));
      await renderActive(previousItem, getTimelineCursor(previousItem));
    }

    renderRuntimeStrip({ summary: runtimeSummaryData() });
  } finally {
    autoAdvanceBusy = false;
  }
}

function schedulePlayback() {
  if (playbackTimer) clearTimeout(playbackTimer);
  if (playbackPaused || !cases.length) return;
  playbackTimer = setTimeout(async function tick() {
    await stepForward();
    schedulePlayback();
  }, 1500);
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
    timelineCursorByRequest = new Map();
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
    timelineCursorByRequest = new Map();
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
    if (!timelineCursorByRequest.has(item.id)) setTimelineCursor(item, 0);
    if (card.closest('#inspectionModeView')) setMode('inspect');
    pausePlayback();
    selectedRequestId = item.id;
    activeIndex = cases.findIndex((entry) => entry.id === item.id);
    renderActive(item, getTimelineCursor(item));
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
backBtn.addEventListener('click', async () => {
  pausePlayback();
  await stepBackward();
});
pauseBtn.addEventListener('click', pausePlayback);
resumeBtn.addEventListener('click', resumePlayback);
stepBtn.addEventListener('click', async () => {
  pausePlayback();
  await stepForward();
});
refreshBtn.addEventListener('click', () => load({ reset: true }));
connectEventStream();
setMode('visual');
load();
