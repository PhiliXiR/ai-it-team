import fs from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cases = JSON.parse(fs.readFileSync(path.join(__dirname, 'request-cases.json'), 'utf8'));

let passCount = 0;

for (const testCase of cases) {
  const result = spawnSync('node', [path.join(__dirname, '../runtime/router/classify-request.js'), testCase.input], {
    encoding: 'utf8'
  });

  const parsed = JSON.parse(result.stdout);
  const pass = parsed.classification === testCase.expectedClassification && parsed.owner === testCase.expectedOwner;

  if (pass) passCount += 1;

  console.log(`CASE: ${testCase.input}`);
  console.log(`  expected: ${testCase.expectedClassification} / ${testCase.expectedOwner}`);
  console.log(`  actual:   ${parsed.classification} / ${parsed.owner}`);
  console.log(`  result:   ${pass ? 'PASS' : 'FAIL'}`);
  console.log('');
}

console.log(`Passed ${passCount}/${cases.length} cases`);
process.exit(passCount === cases.length ? 0 : 1);
