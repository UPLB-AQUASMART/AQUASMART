"""Repository-root Render compatibility entrypoint.

The production FastAPI app lives in backend.api.main. Some Render services can
start from the repository root with `uvicorn main:app`, while the intended
backend-root setup starts from `backend/`. This shim keeps the root command
valid too.
"""

from backend.api.main import app

