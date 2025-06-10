import http.server
import socketserver
import os

# Port sur lequel le serveur va écouter
PORT = 5005

# Répertoire contenant les fichiers à servir
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serveur démarré sur le port {PORT}")
        print(f"Ouvrez votre navigateur à l'adresse : http://localhost:{PORT}")
        # Serve requests indefinitely until interrupted
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nArrêt du serveur...")
finally:
    if httpd:
        # Ensure the server is shut down and its socket is closed
        httpd.server_close()
        print(f"Serveur arrêté et port {PORT} libéré.")