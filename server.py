"""
Sentinel AI Text Detector - SQLite REST API Server
Provides authentication endpoints and persistent SQLite database storage for text analysis records.
"""
import os
import json
import sqlite3
import hashlib
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

DB_FILE = os.path.join(os.path.dirname(__file__), "sentinel.db")

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    # Analysis History table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analysis_history (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        title TEXT,
        text TEXT,
        ai_score REAL,
        verdict TEXT,
        verdict_class TEXT,
        word_count INTEGER,
        sentence_count INTEGER,
        burstiness REAL,
        ttr REAL,
        grammar_score REAL,
        metrics_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    conn.close()
    print(f"[Sentinel Server] SQLite database initialized at {DB_FILE}")

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

class RequestHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def _send_json(self, data, status=200):
        self.send_response(status)
        self._send_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def _get_post_data(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            return {}
        body = self.rfile.read(content_length)
        return json.loads(body.decode('utf-8'))

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        params = parse_qs(parsed.query)

        if path == '/api/health':
            self._send_json({"status": "ok", "database": "sqlite3", "file": DB_FILE})
            return

        if path == '/api/history':
            username = params.get('username', [None])[0]
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            if username and username != 'all':
                cursor.execute("""
                    SELECT id, username, timestamp, title, text, ai_score as aiScore, verdict, 
                           verdict_class as verdictClass, word_count as wordCount, 
                           sentence_count as sentenceCount, burstiness, ttr, grammar_score as grammarScore, 
                           metrics_json
                    FROM analysis_history 
                    WHERE username = ?
                    ORDER BY created_at DESC
                """, (username,))
            else:
                cursor.execute("""
                    SELECT id, username, timestamp, title, text, ai_score as aiScore, verdict, 
                           verdict_class as verdictClass, word_count as wordCount, 
                           sentence_count as sentenceCount, burstiness, ttr, grammar_score as grammarScore, 
                           metrics_json
                    FROM analysis_history 
                    ORDER BY created_at DESC
                """)
            
            rows = cursor.fetchall()
            records = []
            for row in rows:
                rec = dict(row)
                if rec.get('metrics_json'):
                    try:
                        metrics = json.loads(rec['metrics_json'])
                        rec.update(metrics)
                    except Exception:
                        pass
                    del rec['metrics_json']
                records.append(rec)

            conn.close()
            self._send_json({"records": records})
            return

        self._send_json({"error": "Endpoint not found"}, status=404)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        data = this_data = self._get_post_data()

        if path == '/api/auth/register':
            username = data.get('username', '').strip().lower()
            email = data.get('email', '').strip()
            password = data.get('password', '')

            if not username or not password:
                self._send_json({"success": False, "message": "Username and password required"}, status=400)
                return

            pw_hash = hash_password(password)
            try:
                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                cursor.execute("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
                               (username, email, pw_hash))
                conn.commit()
                conn.close()
                self._send_json({"success": True, "message": "User registered successfully", "user": {"username": username, "email": email}})
            except sqlite3.IntegrityError:
                self._send_json({"success": False, "message": "Username already exists"}, status=400)
            return

        if path == '/api/auth/login':
            login_input = data.get('username', '').strip().lower()
            password = data.get('password', '')

            pw_hash = hash_password(password)
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE (username = ? OR email = ?) AND password_hash = ?", (login_input, login_input, pw_hash))
            user = cursor.fetchone()
            conn.close()

            if user:
                self._send_json({"success": True, "message": "Login successful", "user": {"username": user['username'], "email": user['email']}})
            else:
                self._send_json({"success": False, "message": "Invalid username/email or password"}, status=401)
            return

        if path == '/api/history/save':
            rec_id = data.get('id')
            username = data.get('username', '').strip().lower()
            if not username or username == 'guest':
                self._send_json({"success": False, "message": "Guest history saving disabled"}, status=400)
                return
            timestamp = data.get('timestamp')
            title = data.get('title')
            text = data.get('text')
            ai_score = data.get('aiScore', 0)
            verdict = data.get('verdict')
            verdict_class = data.get('verdictClass', '')
            word_count = data.get('wordCount', 0)
            sentence_count = data.get('sentenceCount', 0)
            burstiness = data.get('burstiness', 0)
            ttr = data.get('ttr', 0)
            grammar_score = data.get('grammarScore', 100)

            metrics_json = json.dumps({
                "lrScore": data.get('lrScore', 0),
                "knnScore": data.get('knnScore', 0),
                "trigramScore": data.get('trigramScore', 0),
                "posScore": data.get('posScore', 0),
                "similarityScore": data.get('similarityScore', 0),
                "perplexityScore": data.get('perplexityScore', 0)
            })

            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO analysis_history 
                (id, username, timestamp, title, text, ai_score, verdict, verdict_class, word_count, sentence_count, burstiness, ttr, grammar_score, metrics_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (rec_id, username, timestamp, title, text, ai_score, verdict, verdict_class, word_count, sentence_count, burstiness, ttr, grammar_score, metrics_json))
            conn.commit()
            conn.close()

            self._send_json({"success": True, "id": rec_id})
            return

        self._send_json({"error": "Endpoint not found"}, status=404)

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path
        data = self._get_post_data()

        if path == '/api/history/delete':
            rec_id = data.get('id')
            if not rec_id:
                self._send_json({"error": "Record ID required"}, status=400)
                return

            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute("DELETE FROM analysis_history WHERE id = ?", (rec_id,))
            conn.commit()
            conn.close()
            self._send_json({"success": True})
            return

        self._send_json({"error": "Endpoint not found"}, status=404)

def run(port=5000):
    init_db()
    server_address = ('', port)
    httpd = HTTPServer(server_address, RequestHandler)
    print(f"[Sentinel Server] Server running on http://localhost:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Sentinel Server] Server stopped.")

if __name__ == '__main__':
    run()
