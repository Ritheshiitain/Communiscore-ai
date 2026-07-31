@echo off
echo ===================================================
echo             CommuniScore-AI Startup
echo ===================================================
echo.

:: Check frontend packages
if not exist "frontend\node_modules\" (
    echo [INFO] Installing frontend packages... (This only runs the first time)
    cd frontend && call npm install && cd ..
    echo.
)

:: Start Backend in a separate window
echo [INFO] Starting Python ML Backend on http://localhost:8000...
start "CommuniScore Backend" cmd /k "cd backend && venv\Scripts\activate && python main.py"

:: Wait 3 seconds for backend to warm up
ping 127.0.0.1 -n 3 > nul

:: Start Frontend in a separate window
echo [INFO] Starting React Frontend on http://localhost:5174...
start "CommuniScore Frontend" cmd /k "cd frontend && call npm run dev"

:: Wait 3 seconds for dev server
ping 127.0.0.1 -n 3 > nul

:: Open browser
echo [INFO] Opening CommuniScore-AI in your browser...
start http://localhost:5174


echo.
echo ===================================================
echo  READY! Please keep the backend and frontend terminal
echo  windows open during your presentation.
echo ===================================================
echo.
pause
