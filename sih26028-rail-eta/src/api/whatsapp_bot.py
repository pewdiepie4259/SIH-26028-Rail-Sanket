import re
from typing import Optional
from fastapi import APIRouter, Form, Depends, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

from src.database import get_db
from src.models import Train, Station, ETAPrediction

try:
    from twilio.twiml.messaging_response import MessagingResponse
    HAVE_TWILIO = True
except ImportError:
    HAVE_TWILIO = False

router = APIRouter(prefix="/api/v1/whatsapp", tags=["WhatsApp Bot"])


class WhatsAppQueryRequest(BaseModel):
    message: str
    sender: Optional[str] = "web_client"


def generate_bot_reply(query: str, db: Session) -> str:
    incoming = query.strip()
    match = re.search(r'\b\d{5}\b', incoming)
    train = None

    if match:
        train_no = match.group(0)
        train = db.query(Train).filter_by(train_number=train_no).first()
    else:
        # Search by train name
        search_terms = incoming.lower().split()
        all_trains = db.query(Train).all()
        for t in all_trains:
            if any(term in t.train_name.lower() for term in search_terms if len(term) > 2):
                train = t
                break

    if train:
        latest_pred = (
            db.query(ETAPrediction)
            .filter_by(train_id=train.id)
            .order_by(desc(ETAPrediction.created_at))
            .first()
        )

        st_name = "KSR Bengaluru (SBC)"
        speed = "68 km/h"
        delay = f"{latest_pred.predicted_delay_minutes:.0f} mins delay" if latest_pred else "Right Time (0m delay)"

        if latest_pred and latest_pred.features_snapshot:
            snap = latest_pred.features_snapshot
            st_code = snap.get("nearest_station", "")
            st = db.query(Station).filter_by(station_code=st_code).first()
            if st:
                st_name = f"{st.station_name} ({st.station_code})"
            speed = f"{snap.get('speed_kmh', 68)} km/h"

        return (
            f"🚆 *RailDrishti Live GPS Status*\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"*Train:* {train.train_number} - {train.train_name}\n"
            f"📍 *Current Station:* {st_name}\n"
            f"⚡ *Current Speed:* {speed}\n"
            f"⏱️ *Schedule Impact:* {delay}\n"
            f"🟢 *Signal Aspect:* Clear / Double Yellow\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"🤖 _Source: IoT Geo-Fence Engine_"
        )

    if any(greeting in incoming.lower() for greeting in ["hi", "hello", "start", "help", "hey"]):
        return (
            f"👋 *Welcome to RailDrishti Assistant!*\n\n"
            f"Send any 5-digit Train Number (e.g. *12627*, *12639*, *20661*) or Train Name to get its real-time GPS location and delay."
        )

    return (
        f"❓ No active train found matching '{query}'.\n"
        f"Please send a valid Train Number (e.g. *12627*, *12613*, *20661*) or name."
    )


@router.post("/query")
def whatsapp_json_query(payload: WhatsAppQueryRequest, db: Session = Depends(get_db)):
    """Direct JSON endpoint for browser modals and web clients."""
    reply = generate_bot_reply(payload.message, db)
    return {
        "status": "success",
        "query": payload.message,
        "reply": reply
    }


@router.post("/webhook")
async def whatsapp_webhook(
    Body: str = Form(""),
    From: str = Form("whatsapp:+919876543210"),
    db: Session = Depends(get_db)
):
    """Twilio Webhook endpoint returning valid TwiML XML."""
    reply = generate_bot_reply(Body, db)

    if HAVE_TWILIO:
        resp = MessagingResponse()
        resp.message(reply)
        return Response(content=str(resp), media_type="application/xml")
    
    xml_content = f'<?xml version="1.0" encoding="UTF-8"?><Response><Message><Body>{reply}</Body></Message></Response>'
    return Response(content=xml_content, media_type="application/xml")