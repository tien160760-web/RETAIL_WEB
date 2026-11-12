
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.endpoints.auth import router as auth_router

from app.core.exceptions import AppException
from app.core.exception_handlers import (
    app_exception_handler,
    validation_exception_handler,
    http_exception_handler,
    unexpected_exception_handler,
)


app = FastAPI(
    title="RETAIL_WEB API",
    description="Backend API for Multi-Branch Retail Management System",
    version="0.1.0",
)


# Đăng ký các Exception Handler
app.add_exception_handler(
    AppException,
    app_exception_handler
)

app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler
)

app.add_exception_handler(
    StarletteHTTPException,
    http_exception_handler
)

app.add_exception_handler(
    Exception,
    unexpected_exception_handler
)


# Đăng ký Authentication Router
app.include_router(
    auth_router,
    prefix="/api/v1"
)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "message": "RETAIL_WEB Backend is running"
    }
