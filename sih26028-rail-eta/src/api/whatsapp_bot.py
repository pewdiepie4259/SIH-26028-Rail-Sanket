import re
from fastapi import APIRouter, Form, Depends, Response
from sqlalchemy.orm import Session
from sqlalchemy import desc
from twilio.twiml.messaging_response import MessagingResponse

from src.database import get_db
from src.models import Train, Station, ETAPrediction

router = APIRouter(prefix="/api/v1/whatsapp", tags=["WhatsApp Bot"])

@router.post("/webhook")
async def whatsapp_webhook(
    Body: str = Form(...),
    From: str = Form(...),
    db: Session = Depends(get_db)
):
    incoming = Body.strip()
    resp = MessagingResponse()
    msg = resp.message()

    match = re.search(r'\b\d{5}\b', incoming)

    if match:
        train_no = match.group(0)
        train = db.query(Train).filter_by(train_number=train_no).first()

        if train:
            # Fetch latest live GPS record
            latest_pred = (
                db.query(ETAPrediction)
                .filter_by(train_id=train.id)
                .order_by(desc(ETAPrediction.created_at))
                .first()
            )

            st_name = "En-Route Section"
            speed = "65 km/h"
            delay = f"{latest_pred.predicted_delay_minutes:.0f} mins delay" if latest_pred else "Right Time"

            if latest_pred and latest_pred.features_snapshot:
                snap = latest_pred.features_snapshot
                st_code = snap.get("nearest_station", "")
                st = db.query(Station).filter_by(station_code=st_code).first()
                if st:
                    st_name = f"{st.station_name} ({st.station_code})"
                speed = f"{snap.get('speed_kmh', 0)} km/h"

            reply = (
                f"🚆 *RailDrishti Live GPS Status*\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"*Train:* {train.train_number} - {train.train_name}\n"
                f"📍 *Current Station:* {st_name}\n"
                f"⚡ *Current Speed:* {speed}\n"
                f"⏱️ *Schedule Impact:* {delay}\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"🤖 _Source: IoT Geo-Fence Engine_"
            )
        else:
            reply = f"❌ Train {train_no} not registered in active corridor database."
    elif any(greeting in incoming.lower() for greeting in ["hi", "hello", "start"]):
        reply = (
            f"👋 *Welcome to RailDrishti Assistant!*\n\n"
            f"Send any 5-digit Train Number (e.g. *12627*, *12639*, *20661*) to get its real-time GPS station location."
        )
    else:
        reply = "Please send a valid 5-digit Train Number (e.g. *12627*) to track status."

    msg.body(reply)
    return Response(content=str(resp), media_type="application/xml")