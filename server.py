import os
import sys
import json
import mimetypes
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

# Paths
WORKSPACE_DIR = Path(__file__).resolve().parent
LOCAL_FRAMES_DIR = WORKSPACE_DIR / "frames"
EXTERNAL_FRAMES_DIR = Path(r"c:\Users\Arun gupta\Downloads\extracted_frames")
FRAMES_DIR = LOCAL_FRAMES_DIR if (LOCAL_FRAMES_DIR.exists() and any(LOCAL_FRAMES_DIR.iterdir())) else EXTERNAL_FRAMES_DIR

class AnimationHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WORKSPACE_DIR), **kwargs)

    def log_message(self, format, *args):
        # Suppress spammy log output for 210 frame requests
        if args and any(str(args[0]).startswith(f'GET /frames/') for _ in [1]):
            return
        super().log_message(format, *args)

    def do_HEAD(self):
        if self.path == '/api/frames':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            return

        if self.path.startswith('/frames/'):
            frame_name = self.path[len('/frames/'):].split('?')[0]
            frame_path = FRAMES_DIR / frame_name
            if frame_path.exists() and frame_path.is_file():
                self.send_response(200)
                mime_type, _ = mimetypes.guess_type(str(frame_path))
                self.send_header('Content-Type', mime_type or 'image/png')
                self.send_header('Cache-Control', 'public, max-age=31536000, immutable')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Length', str(frame_path.stat().st_size))
                self.end_headers()
                return

        return super().do_HEAD()

    def do_GET(self):
        # API to list all frame filenames in exact sorted order
        if self.path == '/api/frames':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            if FRAMES_DIR.exists():
                extensions = ('.png', '.jpg', '.jpeg', '.webp')
                frames = [f.name for f in sorted(FRAMES_DIR.iterdir(), key=lambda x: x.name) if f.suffix.lower() in extensions]
            else:
                frames = []
            
            self.wfile.write(json.dumps(frames).encode('utf-8'))
            return

        # Serve frames directly from the extracted_frames directory
        if self.path.startswith('/frames/'):
            frame_name = self.path[len('/frames/'):].split('?')[0]
            frame_path = FRAMES_DIR / frame_name
            
            if frame_path.exists() and frame_path.is_file():
                self.send_response(200)
                mime_type, _ = mimetypes.guess_type(str(frame_path))
                self.send_header('Content-Type', mime_type or 'image/png')
                self.send_header('Cache-Control', 'public, max-age=31536000, immutable')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Length', str(frame_path.stat().st_size))
                self.end_headers()
                
                with open(frame_path, 'rb') as f:
                    self.copyfile(f, self.wfile)
                return
            else:
                self.send_error(404, f"Frame not found: {frame_name}")
                return

        # Default static file handler for index.html, style.css, app.js
        return super().do_GET()

def run_server(port=3000):
    for p in [port, 3001, 8000, 8080, 5000]:
        try:
            ThreadingHTTPServer.allow_reuse_address = True
            server_address = ('127.0.0.1', p)
            httpd = ThreadingHTTPServer(server_address, AnimationHandler)
            print(f"ANIMATION_SERVER_READY: http://localhost:{p}")
            sys.stdout.flush()
            httpd.serve_forever()
            break
        except OSError as e:
            print(f"Port {p} occupied ({e}), trying next...")
            sys.stdout.flush()
            continue

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    run_server(port)
