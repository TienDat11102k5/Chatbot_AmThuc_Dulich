"""
Script chạy AI Service server
Chạy: python run_server.py
"""

import subprocess
import sys
import os

def main():
    """Chạy FastAPI server"""
    print("🚀 KHỞI ĐỘNG AI SERVICE SERVER")
    print("="*50)
    print("📡 Server sẽ chạy tại: http://localhost:8000")
    print("📚 Swagger UI: http://localhost:8000/docs")
    print("🔧 Để dừng server: Ctrl+C")
    print("="*50)
    
    try:
        # Chạy uvicorn server
        cmd = [
            sys.executable, "-m", "uvicorn", 
            "src.main:app", 
            "--reload", 
            "--port", "8000",
            "--host", "0.0.0.0"
        ]
        
        # Chạy từ thư mục ai_service
        subprocess.run(cmd, cwd=os.path.dirname(os.path.abspath(__file__)))
        
    except KeyboardInterrupt:
        print("\n\n🛑 Server đã dừng.")
    except Exception as e:
        print(f"\n❌ Lỗi khi chạy server: {e}")
        print("\n💡 Hãy đảm bảo:")
        print("   1. Đã cài đặt: pip install -r requirements.txt")
        print("   2. PostgreSQL đang chạy")
        print("   3. File .env có cấu hình đúng")

if __name__ == "__main__":
    main()