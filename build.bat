@echo off
echo ================================
echo   Build Script للمشروع
echo ================================
echo.

REM Check if .env.production exists
if not exist .env.production (
    echo [!] تحذير: ملف .env.production غير موجود
    echo [i] قم بنسخ .env.production.example الى .env.production وتعديله
    echo.
    pause
    exit /b 1
)

echo [1/3] تنظيف Build السابق...
if exist dist rmdir /s /q dist

echo [2/3] Building المشروع...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [X] فشل Build!
    pause
    exit /b 1
)

echo [3/3] Build تم بنجاح!
echo.
echo ================================
echo   الخطوات التالية:
echo ================================
echo 1. ارفع محتويات مجلد dist على السيرفر
echo 2. تأكد من ضبط Environment Variables
echo 3. اختبر المشاركة باستخدام Facebook Debugger
echo.
echo ملف dist جاهز للرفع!
echo ================================
pause
