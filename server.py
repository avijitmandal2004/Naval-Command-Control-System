from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import sqlite3
import os
from database import init_db

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend"))

app = Flask(__name__, static_folder=None)
CORS(app)
init_db()

# -------------------- SERVE FRONTEND --------------------
@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/<path:filename>")
def frontend_files(filename):
    return send_from_directory(FRONTEND_DIR, filename)

# -------------------- ALERT STATE --------------------
current_alert = {
    "status": "SAFE",
    "message": "No active incident",
    "severity": "LOW",
    "time": "",
    "location": ""
}

# -------------------- DETECTOR API --------------------
@app.route("/alert", methods=["POST"])
def receive_alert():
    global current_alert
    data = request.json

    current_alert = {
        "status": "ALERT",
        "message": data.get("message"),
        "severity": data.get("severity"),
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "location": data.get("location")
    }

    conn = sqlite3.connect("alerts.db")
    c = conn.cursor()
    c.execute("""
        INSERT INTO alerts (message, severity, time, location)
        VALUES (?, ?, ?, ?)
    """, (
        current_alert["message"],
        current_alert["severity"],
        current_alert["time"],
        current_alert["location"]
    ))
    conn.commit()
    conn.close()

    return jsonify({"success": True})

# -------------------- GET ALERT --------------------
@app.route("/get_alert")
def get_alert():
    return jsonify(current_alert)

# -------------------- ACK ALERT --------------------
@app.route("/acknowledge_alert", methods=["POST"])
def acknowledge_alert():
    global current_alert
    if current_alert["status"] == "ALERT":
        current_alert["status"] = "ACKNOWLEDGED"
    return jsonify({"success": True})

# -------------------- STATS --------------------
@app.route("/get_stats")
def get_stats():
    conn = sqlite3.connect("alerts.db")
    c = conn.cursor()

    c.execute("SELECT COUNT(*) FROM alerts")
    total = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM alerts WHERE DATE(time)=DATE('now')")
    today = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM alerts WHERE time >= datetime('now','-1 day')")
    last_24 = c.fetchone()[0]

    conn.close()

    return jsonify({
        "total": total,
        "today": today,
        "last_24_hours": last_24
    })

# -------------------- RUN --------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
