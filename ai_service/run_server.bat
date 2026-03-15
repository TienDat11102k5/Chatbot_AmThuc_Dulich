@echo off
echo ========================================
echo   AI SERVICE - Chatbot Du Lich
echo ========================================
echo.
echo Dang khoi dong server...
echo API: http://localhost:8000/api/v1/ai/chat
echo Docs: http://localhost:8000/docs
echo.
echo Nhan Ctrl+C de dung server
echo ========================================
echo.

set PYTHONPATH=.
python -m uvicorn src.main:app --reload --port 8000
