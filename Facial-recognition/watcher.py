import cv2
import face_recognition
import requests
import time
import threading
import numpy as np
from flask import Flask, jsonify, request
import logging
import datetime

# --- CONFIG ---
RTSP_URL = "rtsp://127.0.0.1:8554/gate"
API_URL = "http://127.0.0.1:5000/gate/toggle"
STATUS_SERVER_PORT = 5001
GATE_CROP = None 
SIMILARITY_MIN = 0.70
COOLDOWN = 30

# Status server
app = Flask(__name__)
_state_lock = threading.Lock()
_state = {"is_closed": None, "confidence": 0.0, "last_updated": None}

@app.route("/status", methods=["GET"])
def status():
    with _state_lock:
        s = _state.copy()
    # convert last_updated to iso if present
    if s["last_updated"]:
        s["last_updated"] = datetime.datetime.fromtimestamp(s["last_updated"]).isoformat()
    return jsonify(s)

@app.route("/calibrate", methods=["POST"])
def calibrate_route():
    # Calibration is an interactive script; instruct user or run externally.
    return jsonify({"ok": False, "message": "Calibration must be run manually: python3 Facial-recognition/calibrate.py"}), 400

def _run_status_server():
    # run Flask in a background thread
    app.run(host="0.0.0.0", port=STATUS_SERVER_PORT, threaded=True, use_reloader=False)

# --- THREADED CAMERA CLASS ---
class CameraStream:
    def __init__(self, url):
        self.stream = cv2.VideoCapture(url)
        self.ret, self.frame = self.stream.read()
        self.running = True
        self.thread = threading.Thread(target=self.update, args=())
        self.thread.daemon = True
        self.thread.start()

    def update(self):
        while self.running:
            # Continuously grab frames to prevent the buffer from filling up
            ret, frame = self.stream.read()
            if ret:
                self.frame = frame
            else:
                time.sleep(0.1)

    def get_frame(self):
        return self.frame

# --- PREP DATA ---
print("Loading face data...")
ref_closed = cv2.imread("closed_reference.jpg", 0)
ref_open = cv2.imread("open_reference.jpg", 0)
auth_img = face_recognition.load_image_file("authorized.jpg")
auth_encoding = face_recognition.face_encodings(auth_img)[0]

# Initialize threaded stream
cam = CameraStream(RTSP_URL)
last_trigger = 0

print("System Active (Real-Time Mode)...")

# Start status server thread
server_thread = threading.Thread(target=_run_status_server, daemon=True)
server_thread.start()
print(f"Status server listening on http://0.0.0.0:{STATUS_SERVER_PORT}/status")

while True:
    time.sleep(0.1)
    frame = cam.get_frame()
    if frame is None: continue
    
    # 1. DOWN-SCALE EVERYTHING (Massive speed boost)
    # Process gate logic at 50% size
    process_frame = cv2.resize(frame, (0,0), fx=0.5, fy=0.5)
    gray = cv2.cvtColor(process_frame, cv2.COLOR_BGR2GRAY)
    
    # Rescale references to match the 50% processing frame
    ref_c_small = cv2.resize(ref_closed, (0,0), fx=0.5, fy=0.5)
    ref_o_small = cv2.resize(ref_open, (0,0), fx=0.5, fy=0.5)

    # 2. MATCH TEMPLATE
    res_c = cv2.matchTemplate(gray, ref_c_small, cv2.TM_CCOEFF_NORMED)
    res_o = cv2.matchTemplate(gray, ref_o_small, cv2.TM_CCOEFF_NORMED)
    
    score_c = res_c.max()
    score_o = res_o.max()

    gate_is_closed = (score_c > score_o) and (score_c > SIMILARITY_MIN)

    # PRINT REAL-TIME LOG
    state = "CLOSED" if gate_is_closed else "OPEN/BLOCKED"
    conf = max(score_c, score_o)
    print(f"[{time.strftime('%H:%M:%S')}] State: {state} | Conf: {conf*100:.1f}%", end="\r")

    # update status server state
    with _state_lock:
        _state["is_closed"] = gate_is_closed
        _state["confidence"] = float(conf)
        _state["last_updated"] = time.time()

    # 3. FACE CHECK (Only every few frames to save CPU)
    if gate_is_closed and (time.time() - last_trigger > COOLDOWN):
        # Resize to 25% for facial recognition (very fast)
        small_rgb = cv2.cvtColor(cv2.resize(frame, (0,0), fx=0.25, fy=0.25), cv2.COLOR_BGR2RGB)
        face_locs = face_recognition.face_locations(small_rgb)
        
        if face_locs:
            encodings = face_recognition.face_encodings(small_rgb, face_locs)
            for enc in encodings:
                if face_recognition.compare_faces([auth_encoding], enc, tolerance=0.5)[0]:
                    print(f"\n[{time.strftime('%H:%M:%S')}] ACCESS GRANTED")
                    try:
                        requests.post(API_URL, timeout=1)
                        last_trigger = time.time()
                    except:
                        pass

    # Visual Feedback
    cv2.imshow("Watcher", cv2.resize(frame, (0,0), fx=0.3, fy=0.3))
    if cv2.waitKey(1) & 0xFF == ord('q'): break

cam.running = False
cv2.destroyAllWindows()