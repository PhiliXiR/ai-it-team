from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from store import read_db, write_db, make_id
from router_logic import classify_input

app = FastAPI(title='ai-it-team python api')


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def add_trace(db: Dict[str, Any], request_id: str, trace_type: str, actor: str, data: Optional[Dict[str, Any]] = None) -> None:
    db['traces'].append({
        'id': make_id('evt'),
        'requestId': request_id,
        'type': trace_type,
        'actor': actor,
        'timestamp': now_iso(),
        'data': data or {}
    })


class CreateRequestBody(BaseModel):
    input: str
    source: str = 'local'
    requester: Optional[str] = None
    targetSystem: Optional[str] = None
    requestedAccess: Optional[str] = None
    justification: Optional[str] = None
    managerApprovalProvided: bool = False


class ApprovalActionBody(BaseModel):
    actor: str = 'human-operator'


@app.get('/api/health')
def health() -> Dict[str, bool]:
    return {'ok': True}


@app.get('/api/requests')
def list_requests() -> Any:
    db = read_db()
    return db['requests']


@app.get('/api/requests/{request_id}')
def get_request(request_id: str) -> Any:
    db = read_db()
    request = next((item for item in db['requests'] if item['id'] == request_id), None)
    if not request:
        raise HTTPException(status_code=404, detail='Request not found')
    return request


@app.post('/api/requests')
def create_request(body: CreateRequestBody) -> Any:
    input_text = body.input.strip()
    if not input_text:
        raise HTTPException(status_code=400, detail='Missing input')

    db = read_db()
    request = {
        'id': make_id('req'),
        'source': body.source,
        'input': input_text,
        'requester': body.requester,
        'targetSystem': body.targetSystem,
        'requestedAccess': body.requestedAccess,
        'justification': body.justification,
        'managerApprovalProvided': body.managerApprovalProvided,
        'status': 'new',
        'createdAt': now_iso(),
        'updatedAt': now_iso()
    }
    db['requests'].append(request)
    add_trace(db, request['id'], 'request.created', 'intake', {'source': request['source']})
    write_db(db)
    return request


@app.post('/api/requests/{request_id}/route')
def route_request(request_id: str) -> Any:
    db = read_db()
    request = next((item for item in db['requests'] if item['id'] == request_id), None)
    if not request:
        raise HTTPException(status_code=404, detail='Request not found')

    routed = classify_input(request['input'])
    request['classification'] = routed['classification']
    request['owner'] = routed['owner']
    request['escalation'] = routed['escalation']
    request['status'] = 'classified'
    request['updatedAt'] = now_iso()

    artifact = {
        'id': make_id('art'),
        'requestId': request['id'],
        'type': f"{routed['classification']}-summary",
        'owner': routed['owner'],
        'content': {
            'summary': request['input'],
            'classification': routed['classification'],
            'owner': routed['owner'],
            'escalation': routed['escalation']
        },
        'createdAt': now_iso()
    }
    db['artifacts'].append(artifact)
    add_trace(db, request['id'], 'request.classified', 'router', {
        'classification': routed['classification'],
        'owner': routed['owner'],
        'escalation': routed['escalation']
    })
    add_trace(db, request['id'], 'artifact.created', routed['owner'], {
        'artifactId': artifact['id'],
        'type': artifact['type']
    })
    write_db(db)
    return {'request': request, 'artifact': artifact}


@app.post('/api/requests/{request_id}/access-review')
def access_review(request_id: str) -> Any:
    db = read_db()
    request = next((item for item in db['requests'] if item['id'] == request_id), None)
    if not request:
        raise HTTPException(status_code=404, detail='Request not found')
    if request.get('classification') != 'access-request':
        raise HTTPException(status_code=400, detail='Request is not an access request')

    requested_access = request.get('requestedAccess') or ''
    privileged = any(word in request['input'].lower() or word in requested_access.lower() for word in ['admin', 'elevated', 'privileged'])
    approval_needed = privileged or not request.get('managerApprovalProvided', False)

    review = {
        'summary': 'IAM lead reviewed the access request for scope, approval needs, and implementation readiness.',
        'recommendedOwner': 'iam-lead' if approval_needed else 'iam-specialist',
        'escalationRecommended': approval_needed,
        'escalationTarget': 'security-director' if approval_needed else None,
        'escalationReason': 'Privileged or incompletely approved access requires additional review.' if approval_needed else None,
        'missingContext': [
            msg for msg, ok in [
                ('Target system should be explicitly identified.', bool(request.get('targetSystem'))),
                ('Requested access level should be explicitly identified.', bool(request.get('requestedAccess'))),
                ('Business justification should be recorded.', bool(request.get('justification'))),
            ] if not ok
        ],
        'approvalNeeded': approval_needed
    }

    request['status'] = 'awaiting-approval' if approval_needed else 'in-progress'
    request['owner'] = review['recommendedOwner']
    request['updatedAt'] = now_iso()

    add_trace(db, request['id'], 'agent.invoked', 'workflow', {'role': 'iam-lead'})
    add_trace(db, request['id'], 'agent.completed', 'iam-lead', review)

    approval = None
    if approval_needed:
        approval = {
            'id': make_id('appr'),
            'requestId': request['id'],
            'type': 'privileged-access' if privileged else 'manager-approval',
            'requestedBy': 'iam-lead',
            'requiredApproverRole': 'security-director' if privileged else 'human-operator',
            'reason': review['escalationReason'] or 'Approval required before access work continues.',
            'status': 'pending',
            'createdAt': now_iso(),
            'resolvedAt': None
        }
        db['approvals'].append(approval)
        add_trace(db, request['id'], 'approval.created', 'workflow', {
            'approvalId': approval['id'],
            'type': approval['type'],
            'requiredApproverRole': approval['requiredApproverRole']
        })

    artifact = {
        'id': make_id('art'),
        'requestId': request['id'],
        'type': 'access-review-note',
        'owner': 'iam-lead',
        'content': review,
        'createdAt': now_iso()
    }
    db['artifacts'].append(artifact)
    add_trace(db, request['id'], 'artifact.created', 'iam-lead', {
        'artifactId': artifact['id'],
        'type': artifact['type']
    })
    write_db(db)
    return {'request': request, 'review': review, 'approval': approval, 'artifact': artifact}


@app.get('/api/requests/{request_id}/trace')
def request_trace(request_id: str) -> Any:
    db = read_db()
    return [item for item in db['traces'] if item['requestId'] == request_id]


@app.get('/api/requests/{request_id}/artifacts')
def request_artifacts(request_id: str) -> Any:
    db = read_db()
    return [item for item in db['artifacts'] if item['requestId'] == request_id]


@app.get('/api/requests/{request_id}/approvals')
def request_approvals(request_id: str) -> Any:
    db = read_db()
    return [item for item in db['approvals'] if item['requestId'] == request_id]


@app.get('/api/approvals')
def list_approvals() -> Any:
    db = read_db()
    return db['approvals']


@app.post('/api/approvals/{approval_id}/approve')
def approve(approval_id: str, body: ApprovalActionBody) -> Any:
    db = read_db()
    approval = next((item for item in db['approvals'] if item['id'] == approval_id), None)
    if not approval:
        raise HTTPException(status_code=404, detail='Approval not found')

    approval['status'] = 'approved'
    approval['resolvedAt'] = now_iso()
    request = next((item for item in db['requests'] if item['id'] == approval['requestId']), None)
    if request:
        request['status'] = 'in-progress'
        request['owner'] = 'iam-specialist'
        request['updatedAt'] = now_iso()
        add_trace(db, request['id'], 'approval.approved', body.actor, {'approvalId': approval['id']})
        add_trace(db, request['id'], 'request.resumed', 'workflow', {'owner': request['owner'], 'status': request['status']})
    write_db(db)
    return {'approval': approval, 'request': request}


@app.post('/api/approvals/{approval_id}/reject')
def reject(approval_id: str, body: ApprovalActionBody) -> Any:
    db = read_db()
    approval = next((item for item in db['approvals'] if item['id'] == approval_id), None)
    if not approval:
        raise HTTPException(status_code=404, detail='Approval not found')

    approval['status'] = 'rejected'
    approval['resolvedAt'] = now_iso()
    request = next((item for item in db['requests'] if item['id'] == approval['requestId']), None)
    if request:
        request['status'] = 'blocked'
        request['updatedAt'] = now_iso()
        add_trace(db, request['id'], 'approval.rejected', body.actor, {'approvalId': approval['id']})
        add_trace(db, request['id'], 'request.blocked', 'workflow', {'status': request['status']})
    write_db(db)
    return {'approval': approval, 'request': request}


@app.get('/api/dashboard/summary')
def dashboard_summary() -> Any:
    db = read_db()
    return {
        'totalRequests': len(db['requests']),
        'classifiedRequests': len([item for item in db['requests'] if item.get('status') == 'classified']),
        'awaitingApproval': len([item for item in db['requests'] if item.get('status') == 'awaiting-approval']),
        'totalArtifacts': len(db['artifacts']),
        'totalTraceEvents': len(db['traces']),
        'totalApprovals': len(db['approvals'])
    }


@app.get('/api/dashboard/history')
def dashboard_history() -> Any:
    db = read_db()
    return list(reversed(db['requests']))[:20]
