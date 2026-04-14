"""Netlify Function Handler - Mangum ASGI Adapter"""

from mangum import Mangum
from app.main import app

handler = Mangum(app)
