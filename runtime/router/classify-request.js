const input = process.argv.slice(2).join(' ').trim();

if (!input) {
  console.log(JSON.stringify({
    error: 'No request text provided',
    usage: 'npm run route -- "user cannot connect to vpn"'
  }, null, 2));
  process.exit(1);
}

const text = input.toLowerCase();

function includesAny(words) {
  return words.some((word) => text.includes(word));
}

let classification = 'support-issue';
let owner = 'helpdesk-lead';
let escalation = [];

if (includesAny(['vpn', 'dns', 'firewall', 'network', 'routing'])) {
  classification = 'support-issue';
  owner = 'network-lead';
  escalation = ['vpn-specialist'];
}

if (includesAny(['access', 'permission', 'role', 'admin tool', 'account'])) {
  classification = 'access-request';
  owner = 'iam-lead';
  escalation = ['iam-specialist'];
}

if (includesAny(['outage', 'multiple users', 'service down', 'incident', 'unreachable'])) {
  classification = 'incident';
  owner = 'incident-lead';
  escalation = ['incident-triage-specialist'];
}

if (includesAny(['firewall rule', 'patch cycle', 'server config', 'change request'])) {
  classification = 'infrastructure-change';
  owner = 'systems-lead';
  escalation = ['infrastructure-director'];
}

const result = {
  input,
  classification,
  owner,
  escalation,
  notes: 'Prototype keyword router only. Intended as a proof-of-direction, not a real classifier.'
};

console.log(JSON.stringify(result, null, 2));
