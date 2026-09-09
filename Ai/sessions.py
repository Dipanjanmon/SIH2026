import json
import os
import threading
import time

BASE = os.path.dirname(os.path.abspath(__file__))
SESS_FILE = os.path.join(BASE, "sessions.json")
DEL_FILE = os.path.join(BASE, "deleted_sessions.json")

_lock = threading.Lock()


def _load(path):
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def _save(path, data):
    with _lock:
        tmp = path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=1)
        os.replace(tmp, path)


def load_sessions():
    return _load(SESS_FILE)


def load_deleted():
    return _load(DEL_FILE)


def save_session(user_id, history):
    data = load_sessions()
    data[user_id] = {"updated": time.time(), "history": history[-40:]}
    _save(SESS_FILE, data)


def get_session(user_id):
    data = load_sessions()
    if user_id in data:
        return data[user_id]["history"]
    return None


def delete_session(user_id):
    """Move a session to the recoverable archive."""
    data = load_sessions()
    if user_id in data:
        del_data = load_deleted()
        del_data[user_id] = data.pop(user_id)
        _save(DEL_FILE, del_data)
    _save(SESS_FILE, data)


def recover_session(user_id):
    """Restore the most recent deleted session for this user."""
    del_data = load_deleted()
    if user_id in del_data:
        data = load_sessions()
        data[user_id] = del_data.pop(user_id)
        _save(SESS_FILE, data)
        _save(DEL_FILE, del_data)
        return data[user_id]["history"]
    return None


def clear_session(user_id):
    data = load_sessions()
    if user_id in data:
        del data[user_id]
    _save(SESS_FILE, data)