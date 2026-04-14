"""
Custom static file server for Next.js static export.
Handles SPA-style routing by serving .html files for clean URLs.
"""
import http.server
import socketserver
import os
import sys


class NextJsStaticHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler that serves .html for clean URLs."""

    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def do_GET(self):
        # Clean the path
        path = self.path.split('?')[0].split('#')[0]

        # Remove trailing slash except for root
        if path != '/' and path.endswith('/'):
            path = path[:-1]

        # Try exact file first
        full_path = os.path.join(self.directory, path.lstrip('/'))

        if os.path.isfile(full_path):
            self.path = path
            return super().do_GET()

        # Try .html extension
        html_path = full_path + '.html'
        if os.path.isfile(html_path):
            self.path = path + '.html'
            return super().do_GET()

        # Try index.html in directory
        index_path = os.path.join(full_path, 'index.html')
        if os.path.isfile(index_path):
            self.path = path + '/index.html'
            return super().do_GET()

        # For _next static assets, serve as-is
        if path.startswith('/_next/') or path.startswith('/images/'):
            return super().do_GET()

        # Fallback: serve 404.html if it exists
        fallback = os.path.join(self.directory, '404.html')
        if os.path.isfile(fallback):
            self.path = '/404.html'
            return super().do_GET()

        return super().do_GET()

    def log_message(self, format, *args):
        # Suppress most logs for cleaner output
        pass


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    directory = sys.argv[2] if len(sys.argv) > 2 else 'out'

    handler = lambda *args, **kwargs: NextJsStaticHandler(*args, directory=directory, **kwargs)

    class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
        """Handle requests in separate threads to avoid connection exhaustion."""
        daemon_threads = True
        allow_reuse_address = True

    server = ThreadedHTTPServer(('0.0.0.0', port), handler)
    print(f"Serving {directory} on http://localhost:{port} (threaded)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
