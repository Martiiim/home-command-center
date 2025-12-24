#!/usr/bin/env python3
"""Simple static file server that adds CORS headers for HLS playback.
Usage: python3 serve_hls_cors.py --directory /path/to/hls --port 8889
"""
import http.server
import socketserver
import argparse
import os


class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET,OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Range,User-Agent,Accept,Origin,Referer')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()


def run(directory: str, port: int):
    os.chdir(directory)
    with socketserver.ThreadingTCPServer(('0.0.0.0', port), CORSRequestHandler) as httpd:
        print(f"Serving {directory} on port {port} with CORS")
        httpd.serve_forever()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--directory', '-d', default=os.path.join(os.path.dirname(__file__), 'hls'))
    parser.add_argument('--port', '-p', type=int, default=8889)
    args = parser.parse_args()
    run(args.directory, args.port)
