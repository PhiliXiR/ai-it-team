from __future__ import annotations

from typing import Dict, List


def classify_input(input_text: str) -> Dict[str, object]:
    text = input_text.lower().strip()

    def includes_any(words: List[str]) -> bool:
        return any(word in text for word in words)

    classification = 'support-issue'
    owner = 'helpdesk-lead'
    escalation: List[str] = []

    if includes_any(['vpn', 'dns', 'firewall', 'network', 'routing']):
        classification = 'support-issue'
        owner = 'network-lead'
        escalation = ['vpn-specialist']

    if includes_any(['access', 'permission', 'role', 'admin tool', 'account']):
        classification = 'access-request'
        owner = 'iam-lead'
        escalation = ['iam-specialist']

    if includes_any(['outage', 'multiple users', 'service down', 'incident', 'unreachable']):
        classification = 'incident'
        owner = 'incident-lead'
        escalation = ['incident-triage-specialist']

    if includes_any(['firewall rule', 'patch cycle', 'server config', 'change request']):
        classification = 'infrastructure-change'
        owner = 'systems-lead'
        escalation = ['infrastructure-director']

    return {
        'classification': classification,
        'owner': owner,
        'escalation': escalation,
        'notes': 'Prototype keyword router only. Intended as a proof-of-direction, not a real classifier.'
    }
