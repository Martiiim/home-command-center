# Facial-recognition

This folder contains the simple facial recognition watcher and a small gate server.

Features
- `watcher.py` — watches RTSP stream and detects gate open/closed by template matching. When closed and an authorized face is seen it triggers the gate via the HTTP toggle endpoint.
- `gate_server.py` — simple Flask endpoint to toggle the gate (used by the watcher)

How to run

1. Install Python deps (recommended in a venv):

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Calibrate when you want (interactive):

```sh
npm run calibrate
# or
python3 Facial-recognition/calibrate.py
```

Calibration is interactive (draw a box over the gate); it is NOT run automatically.

3. Start watcher + gate server (via npm):

```sh
npm run facial
```

Status & integration with frontend

- The watcher exposes a small status server on port `5001`:
  - `GET http://127.0.0.1:5001/status` -> `{ "is_closed": <bool>, "confidence": <float>, "last_updated": "<ISO time>" }`
  - `POST /calibrate` -> returns an instruction (calibration is interactive; use `npm run calibrate`).

- The existing `device-proxy` has a proxied endpoint at:
  - `GET http://127.0.0.1:3001/api/gate-status` (used by the frontend)

Notes
- `npm run dev:all` will run the React dev server, the `device-proxy` and the facial services (`npm run facial`).
- The watcher uses `cv2.imshow` for visual feedback; on headless servers this may fail—run locally or disable display as needed.

