#!/usr/bin/env bash
set -euo pipefail
# Usage: ./run_ffmpeg_docker.sh [OUTPUT_DIR] [RTSP_URL]
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="${1:-$ROOT_DIR/server/hls/cam}"
RTSP_URL="${2:-rtsp://192.168.1.74:554/user=admin_password=4zcyZeMW_channel=1_stream=0.sdp?real_stream}"

mkdir -p "$OUTPUT_DIR"
echo "Writing HLS to: $OUTPUT_DIR"
docker run --rm --network host -v "$OUTPUT_DIR":/output jrottenberg/ffmpeg:5.1-ubuntu \
  -rtsp_transport tcp -i "$RTSP_URL" \
  -c:v libx264 -preset ultrafast -tune zerolatency -b:v 800k -an \
  -f hls -hls_time 4 -hls_list_size 5 -hls_flags delete_segments /output/index.m3u8

echo "Done. Serve $OUTPUT_DIR with: cd $(dirname "$OUTPUT_DIR") && python3 -m http.server 8889"
