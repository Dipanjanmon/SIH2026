import os
import sys
import time
import threading
import subprocess
import webbrowser

BASE = os.path.dirname(os.path.abspath(__file__))
os.chdir(BASE)

HTML = os.path.join(BASE, "chat_voice_offline.html")
PORT = 5000

APP_NAME = "SmartBot Pro"
BANNER = f"""
=============================================
   {APP_NAME} — Chat + Neural Voice
   বাংলা / हिंदी / English  •  Free offline
=============================================
"""


def set_ssl():
    try:
        import certifi
        os.environ["SSL_CERT_FILE"] = certifi.where()
    except Exception as e:
        print("(!) certifi not found, SSL may fail:", e)


def is_server_running():
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.3)
        try:
            s.connect(("127.0.0.1", PORT))
            return True
        except OSError:
            return False


def run_server():
    set_ssl()
    # launch server.py as a separate child process for stability
    py = sys.executable
    proc = subprocess.Popen(
        [py, "server.py"],
        cwd=BASE,
        stdout=open(os.path.join(BASE, "server_log.txt"), "w"),
        stderr=subprocess.STDOUT,
    )
    return proc


def main():
    print(BANNER)
    set_ssl()
    proc = None

    if is_server_running():
        print(f"[+] Server already running on port {PORT}")
    else:
        print(f"[+] Starting server on http://localhost:{PORT} ...")
        proc = run_server()
        for _ in range(40):
            time.sleep(0.5)
            if is_server_running():
                break
        if not is_server_running():
            print("[!] Server could not start. Check python + flask.")
            log = os.path.join(BASE, "server_log.txt")
            if os.path.exists(log):
                print("---- server log ----")
                print(open(log, encoding="utf-8", errors="replace").read()[-2000:])
            sys.exit(1)
        print("[+] Server ready.")

    print("[+] Opening demo in browser ...")
    webbrowser.open(f"file:///{HTML.replace(os.sep, '/')}")

    url = f"http://localhost:{PORT}/health"
    print(f"""
=============================================
  ✔ Server      : http://localhost:{PORT}
  ✔ Demo page   : opened in browser
  ✔ Voice       : neural (Bangla/Hindi/English)
  ✔ AI          : OpenRouter free model

  Keep this window open. Press Ctrl+C to stop.
=============================================
""")
    try:
        while True:
            time.sleep(1)
            if not is_server_running():
                print("[!] Server stopped unexpectedly. Restarting ...")
                proc = run_server()
                for _ in range(40):
                    time.sleep(0.5)
                    if is_server_running():
                        break
    except KeyboardInterrupt:
        print("\n[+] Stopping.")


if __name__ == "__main__":
    main()