#!/bin/bash
# =============================================================================
# entrypoint.sh — AI Service Docker Entrypoint
# Purpose: Wait for DB tables → Import data (if empty) → Start Uvicorn server
# =============================================================================

set -e

echo "=================================================="
echo " AI Service Entrypoint Starting..."
echo "=================================================="

# ---------------------------------------------------------------------------
# STEP 1: Wait for PostgreSQL to be ready (TCP check via Python)
# ---------------------------------------------------------------------------
echo "[1/3] Waiting for PostgreSQL..."

MAX_RETRIES=60
RETRY_COUNT=0

while ! python3 -c "
import socket, os
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(2)
host = os.getenv('DB_HOST', 'database')
port = int(os.getenv('DB_PORT', '5432'))
s.connect((host, port))
s.close()
" 2>/dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "  PostgreSQL not available after $MAX_RETRIES retries. Starting server without data import."
        exec uvicorn src.main:app --host 0.0.0.0 --port 8000
    fi
    echo "  ... retry $RETRY_COUNT/$MAX_RETRIES"
    sleep 2
done
echo "  PostgreSQL is reachable!"

# ---------------------------------------------------------------------------
# STEP 2: Wait for Flyway migrations to create tables
# ---------------------------------------------------------------------------
echo "[2/3] Waiting for database tables (Flyway migrations from backend)..."

TABLE_RETRIES=0
MAX_TABLE_RETRIES=90

while ! python3 -c "
import psycopg2, os
conn = psycopg2.connect(
    host=os.getenv('DB_HOST', 'database'),
    port=int(os.getenv('DB_PORT', '5432')),
    database=os.getenv('DB_NAME', 'chatbot_db'),
    user=os.getenv('DB_USER', 'admin'),
    password=os.getenv('DB_PASSWORD', 'password')
)
cur = conn.cursor()
cur.execute(\"SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='places')\")
exists = cur.fetchone()[0]
cur.close()
conn.close()
exit(0 if exists else 1)
" 2>/dev/null; do
    TABLE_RETRIES=$((TABLE_RETRIES + 1))
    if [ $TABLE_RETRIES -ge $MAX_TABLE_RETRIES ]; then
        echo "  Tables not found after $MAX_TABLE_RETRIES retries. Starting server without data."
        exec uvicorn src.main:app --host 0.0.0.0 --port 8000
    fi
    echo "  ... waiting for Flyway tables ($TABLE_RETRIES/$MAX_TABLE_RETRIES)"
    sleep 3
done
echo "  Database tables are ready!"

# ---------------------------------------------------------------------------
# STEP 3: Import data if tables are empty
# ---------------------------------------------------------------------------
echo "[3/3] Checking if data needs to be imported..."

NEEDS_IMPORT=$(python3 -c "
import psycopg2, os
conn = psycopg2.connect(
    host=os.getenv('DB_HOST', 'database'),
    port=int(os.getenv('DB_PORT', '5432')),
    database=os.getenv('DB_NAME', 'chatbot_db'),
    user=os.getenv('DB_USER', 'admin'),
    password=os.getenv('DB_PASSWORD', 'password')
)
cur = conn.cursor()
cur.execute('SELECT COUNT(*) FROM places')
count = cur.fetchone()[0]
cur.close()
conn.close()
print('yes' if count == 0 else 'no')
" 2>/dev/null || echo "error")

if [ "$NEEDS_IMPORT" = "yes" ]; then
    echo "  Tables are empty! Running smart_import.py..."
    if python3 smart_import.py; then
        echo "  Data import completed!"
    else
        echo "  WARNING: Data import failed! Server will start but Recommender may return empty results."
    fi
elif [ "$NEEDS_IMPORT" = "no" ]; then
    echo "  Data already exists. Skipping import."
else
    echo "  Could not check data status. Skipping import."
fi

# ---------------------------------------------------------------------------
# STEP 4: Start the Uvicorn server
# ---------------------------------------------------------------------------
echo ""
echo "=================================================="
echo " Starting AI Service (Uvicorn)..."
echo "=================================================="

exec uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 2
