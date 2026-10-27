"""
Standalone Launcher for ACO/ECG Backend.
"""
import sys
import os

# Add root directory to python path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Starting ACO / ECG Backend Core Engine from {ROOT_DIR} on http://{host}:{port} ...")
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=False)
