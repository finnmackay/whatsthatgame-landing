#!/usr/bin/env python3
"""Local dev server matching vercel.json's cleanUrls:true — /business resolves to business.html."""
import http.server
import os
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5173


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


class CleanUrlHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        url_path = path.split("?", 1)[0].split("#", 1)[0]
        if url_path != "/" and not os.path.splitext(url_path)[1]:
            candidate = url_path.lstrip("/") + ".html"
            if os.path.isfile(candidate):
                path = url_path + ".html"
        return super().translate_path(path)


if __name__ == "__main__":
    with ReusableTCPServer(("", PORT), CleanUrlHandler) as httpd:
        print(f"Serving on http://localhost:{PORT} (clean URLs on)")
        httpd.serve_forever()
