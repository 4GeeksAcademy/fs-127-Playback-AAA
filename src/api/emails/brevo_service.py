import os
import requests
from email.utils import parseaddr

def send_email(msg):
    api_key = os.getenv("BREVO_API_KEY")
    if not api_key:
        print("[Brevo] BREVO_API_KEY no configurada")
        return False

    sender_raw = msg.sender
    if isinstance(sender_raw, tuple):
        sender = {"name": sender_raw[0], "email": sender_raw[1]}
    else:
        name, email = parseaddr(sender_raw)
        sender = {"name": name or "Playback", "email": email}

    payload = {
        "sender": sender,
        "to": [{"email": r} for r in msg.recipients],
        "subject": msg.subject,
        "htmlContent": msg.html or msg.body,
    }

    response = requests.post(
        "https://api.brevo.com/v3/smtp/email",
        headers={
            "api-key": api_key,
            "Content-Type": "application/json",
        },
        json=payload,
    )

    if response.status_code not in (200, 201):
        print(f"[Brevo] Error {response.status_code}: {response.text}")
        return False

    return True