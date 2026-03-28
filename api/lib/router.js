import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

export function classifyInput(input) {
  const result = spawnSync('node', [path.join(repoRoot, 'runtime', 'router', 'classify-request.js'), input], {
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || 'Failed to classify request');
  }

  return JSON.parse(result.stdout);
}
