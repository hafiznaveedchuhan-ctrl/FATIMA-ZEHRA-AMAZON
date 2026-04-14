"""Netlify Function Handler - Mangum ASGI Adapter"""

from mangum import Mangum
from app.main import app

# Wrap FastAPI app with Mangum for Netlify Functions
handler = Mangum(app)
