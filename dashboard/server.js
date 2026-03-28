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

app.get('/api/tests', (_req, res) => {
  const cases = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'request-cases.json'), 'utf8'));
  const results = cases.map((testCase) => {
    const result = spawnSync('node', [path.join(root, 'runtime', 'router', 'classify-request.js'), testCase.input], {
      encoding: 'utf8'
    });

    const parsed = JSON.parse(result.stdout);
    const pass = parsed.classification === testCase.expectedClassification && parsed.owner === testCase.expectedOwner;

    return {
      input: testCase.input,
      expectedClassification: testCase.expectedClassification,
      expectedOwner: testCase.expectedOwner,
      actualClassification: parsed.classification,
      actualOwner: parsed.owner,
      escalation: parsed.escalation,
      pass
    };
  });

  const passed = results.filter((r) => r.pass).length;
  res.json({ passed, total: results.length, results });
});

app.listen(PORT, () => {
  console.log(`ai-it-team dashboard running at http://localhost:${PORT}`);
});
