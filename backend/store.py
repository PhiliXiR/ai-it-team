from __future__ import annotations

import json
import random
import string
from pathlib import Path
from typing import Any, Dict

ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / 'storage' / 'db.json'


def read_db() -> Dict[str, Any]:
    with DB_PATH.open('r', encoding='utf-8') as f:
        data = json.load(f)
    data.setdefault('requests', [])
    data.setdefault('traces', [])
    data.setdefault('artifacts', [])
    data.setdefault('approvals', [])
    return data


def write_db(data: Dict[str, Any]) -> None:
    with DB_PATH.open('w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)


def make_id(prefix: str) -> str:
    token = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f'{prefix}_{token}'
