#!/usr/bin/env python3
"""Launch a backend service with .env.backend loaded into os.environ."""
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

HERE = Path(__file__).resolve().parent
load_dotenv(HERE / ".env.backend", override=True)

svc_dir = sys.argv[1]
port = sys.argv[2]

os.chdir(svc_dir)
sys.path.insert(0, svc_dir)

import uvicorn
uvicorn.run("app.main:app", host="0.0.0.0", port=int(port), log_level="info")
