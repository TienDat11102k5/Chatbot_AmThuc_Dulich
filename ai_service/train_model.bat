@echo off
echo ========================================
echo   TRAIN AI MODEL - Chatbot Du Lich
echo ========================================
echo.

echo [1/4] Gop du lieu training (regions)...
set PYTHONPATH=.
python merge_data.py
if errorlevel 1 (
    echo.
    echo [ERROR] Gop du lieu training that bai!
    pause
    exit /b 1
)

echo.
echo [2/4] Gop du lieu knowledge (foods + places)...
python merge_knowledge.py
if errorlevel 1 (
    echo.
    echo [ERROR] Gop du lieu knowledge that bai!
    pause
    exit /b 1
)

echo.
echo [3/4] Kiem tra du lieu...
python -m src.validate_data
if errorlevel 1 (
    echo.
    echo [ERROR] Du lieu khong hop le!
    pause
    exit /b 1
)

echo.
echo [4/4] Train model AI...
python -m src.core.intent_classifier
if errorlevel 1 (
    echo.
    echo [ERROR] Train model that bai!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   TRAIN THANH CONG!
echo ========================================
echo.
echo Model: models/intent_model.pkl
echo Bao cao: docs/metrics.txt
echo Knowledge: 76 ban ghi (35 mon an, 41 dia diem)
echo.
echo Chay server: run_server.bat
echo.
pause
