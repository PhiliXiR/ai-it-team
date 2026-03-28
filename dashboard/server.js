import express from 'express';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const app = express();
const PORT = process.env.PORT || 4411;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

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

function classify(text) {
  const result = spawnSync('node', [path.join(root, 'runtime', 'router', 'classify-request.js'), text], {
    encoding: 'utf8'
  });

  const parsed = JSON.parse(result.stdout);
  return { ...parsed, route: buildRoute(parsed) };
}

app.get('/api/tests', (_req, res) => {
  const cases = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'request-cases.json'), 'utf8'));
  const results = cases.map((testCase) => {
    const parsed = classify(testCase.input);
    const pass = parsed.classification === testCase.expectedClassification && parsed.owner === testCase.expectedOwner;

    return {
      input: testCase.input,
      expectedClassification: testCase.expectedClassification,
      expectedOwner: testCase.expectedOwner,
      actualClassification: parsed.classification,
      actualOwner: parsed.owner,
      escalation: parsed.escalation,
      route: parsed.route,
      pass
    };
  });

  const passed = results.filter((r) => r.pass).length;
  res.json({ passed, total: results.length, results });
});

app.post('/api/classify', (req, res) => {
  const text = String(req.body?.input || '').trim();
  if (!text) {
    return res.status(400).json({ error: 'Missing input' });
  }

  const parsed = classify(text);
  res.json(parsed);
});

app.listen(PORT, () => {
  console.log(`ai-it-team dashboard running at http://localhost:${PORT}`);
});
