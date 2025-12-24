import cv2

RTSP_URL = "rtsp://127.0.0.1:8554/gate"
vcap = cv2.VideoCapture(RTSP_URL)
ret, frame = vcap.read()

if ret:
    # Scale down for display only
    scale = 0.4 
    display_width = int(frame.shape[1] * scale)
    display_height = int(frame.shape[0] * scale)
    small_frame = cv2.resize(frame, (display_width, display_height))

    print("Draw a box over the gate area and press ENTER")
    roi = cv2.selectROI("Calibration", small_frame)
    
    # Scale coordinates back up to full size
    real_roi = tuple(int(i / scale) for i in roi)
    
    print(f"\nCOPY THIS TO watcher.py -> GATE_CROP: {real_roi}")
    cv2.destroyAllWindows()
else:
    print("Could not connect to RTSP stream.")