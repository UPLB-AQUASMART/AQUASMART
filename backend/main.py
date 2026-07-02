"""Render-compatible FastAPI entrypoint.

The application package lives in api.main, but some Render services are
configured with the default `uvicorn main:app` start command from the backend
root. Re-exporting app here keeps both `main:app` and `api.main:app` valid.
"""

from api.main import app

