@echo off
echo ========================================
echo   SETUP POSTGRESQL FOR AI SERVICE
echo ========================================
echo.

echo [1/3] Cai dat thu vien psycopg2...
pip install psycopg2-binary
echo.

echo [2/3] Chay migration database...
echo Vui long chay backend Spring Boot truoc de migration tu dong!
echo Hoac chay migration thu cong: mvn flyway:migrate
pause
echo.

echo [3/3] Import du lieu CSV vao PostgreSQL...
python import_to_postgres.py
echo.

echo ========================================
echo   HOAN TAT!
echo ========================================
echo.
echo Kiem tra database:
echo   psql -U admin -d chatbot_db
echo   SELECT COUNT(*) FROM foods;
echo   SELECT COUNT(*) FROM places;
echo.
pause
