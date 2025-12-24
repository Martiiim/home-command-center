import socket
import time
from flask import Flask, jsonify

app = Flask(__name__)

TCP_HOST = "47.254.152.213"
TCP_PORT = 8950

PAYLOAD_GATE_ON = bytes.fromhex("fc99e49c981fbf840d8eb18bfa0000000000000000050021fe01070799e49c981fbf840d8eb18bfa0000000000000000020100020201058aef31cf")
PAYLOAD_GATE_OFF = bytes.fromhex("fc99e49c981fbf840d8eb18bfa0000000000000000050021fe01070799e49c981fbf840d8eb18bfa0000000000000000020000020201065fef31cf")

def send_payload(payload: bytes):
    with socket.create_connection((TCP_HOST, TCP_PORT), timeout=5) as s:
        s.sendall(payload)

@app.route("/gate/toggle", methods=["POST"])
def toggle_gate():
    try:
        send_payload(PAYLOAD_GATE_ON)
        time.sleep(0.3)
        send_payload(PAYLOAD_GATE_OFF)
        return jsonify({"success": True, "message": "Gate toggled"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)