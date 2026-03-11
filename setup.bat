@echo off
echo ========================================
echo Learn-EZ Setup Script for Windows
echo ========================================
echo.

echo Step 1: Cleaning previous installation...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
)
if exist .next (
    echo Removing .next cache...
    rmdir /s /q .next
)
echo Clean complete!
echo.

echo Step 2: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: npm install failed!
    echo Please check your Node.js installation.
    pause
    exit /b 1
)
echo Dependencies installed successfully!
echo.

echo Step 3: Checking environment variables...
if not exist .env.local (
    echo WARNING: .env.local file not found!
    echo Creating .env.local from template...
    (
        echo NEXT_PUBLIC_API_URL=https://backend-lms-lv7l.onrender.com/api/v1
        echo NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_public_key_here
    ) > .env.local
    echo .env.local created! Please update with your Stripe key.
    echo.
) else (
    echo .env.local found!
    echo.
)

echo ========================================
echo Setup Complete! 🎉
echo ========================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo Then open http://localhost:3000 in your browser
echo.
pause
