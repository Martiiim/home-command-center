# HLS Setup (host/Docker)

This file explains how to produce HLS from your LAN camera and serve it so the app can load the real stream instead of the fallback.

Recommended: run these commands on your host machine (so they have access to your LAN camera at 192.168.1.74).

Option 1 — Docker (recommended if you don't want to install ffmpeg locally)

```bash
# write HLS segments to ~/hls/cam and serve them with Python
mkdir -p ~/hls/cam
docker run --rm --network host -v ~/hls/cam:/output jrottenberg/ffmpeg:5.1-ubuntu \
  -rtsp_transport tcp -i "rtsp://192.168.1.74:554/user=admin_password=4zcyZeMW_channel=1_stream=0.sdp?real_stream" \
  -c:v libx264 -preset ultrafast -tune zerolatency -b:v 800k -an \
  -f hls -hls_time 4 -hls_list_size 5 -hls_flags delete_segments /output/index.m3u8

# serve the HLS files on port 8889
cd ~/hls && python3 -m http.server 8889

# App HLS URL: http://<YOUR_HOST_IP>:8889/index.m3u8 (or /cam/index.m3u8 if you used /cam)
```

Option 2 — Host ffmpeg (if you have ffmpeg installed)

```bash
mkdir -p ~/hls/cam
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.74:554/user=admin_password=4zcyZeMW_channel=1_stream=0.sdp?real_stream" \
  -c:v libx264 -preset ultrafast -tune zerolatency -b:v 800k -an \
  -f hls -hls_time 4 -hls_list_size 5 -hls_flags delete_segments ~/hls/cam/index.m3u8

cd ~/hls && python3 -m http.server 8889
```

Testing the RTSP source (quick check):

```bash
ffprobe -rtsp_transport tcp "rtsp://192.168.1.74:554/user=admin_password=4zcyZeMW_channel=1_stream=0.sdp?real_stream"
# or try VLC -> Open Network Stream -> paste the RTSP URL
```

After producing HLS, point the app to the HLS playlist. If you produce the files at `~/hls/cam/index.m3u8` and serve them with Python, use:

`http://<YOUR_HOST_IP>:8889/cam/index.m3u8`

If you want, run the helper scripts in `server/` provided in this repo to simplify running the Docker ffmpeg and serving files.
