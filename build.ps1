# Build Script للمشروع
Write-Host "================================" -ForegroundColor Cyan
Write-Host "   Build Script للمشروع" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.production exists
if (-Not (Test-Path ".env.production")) {
    Write-Host "[!] تحذير: ملف .env.production غير موجود" -ForegroundColor Yellow
    Write-Host "[i] قم بنسخ .env.production.example الى .env.production وتعديله" -ForegroundColor Yellow
    Write-Host ""
    
    $response = Read-Host "هل تريد إنشاء الملف الآن؟ (y/n)"
    if ($response -eq "y") {
        Copy-Item ".env.production.example" ".env.production"
        Write-Host "[✓] تم إنشاء .env.production - يرجى تعديله قبل المتابعة" -ForegroundColor Green
        notepad .env.production
        exit
    } else {
        exit 1
    }
}

Write-Host "[1/3] تنظيف Build السابق..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

Write-Host "[2/3] Building المشروع..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[X] فشل Build!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "[3/3] Build تم بنجاح!" -ForegroundColor Green
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "   الخطوات التالية:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "1. ارفع محتويات مجلد dist على السيرفر" -ForegroundColor White
Write-Host "2. تأكد من ضبط Environment Variables" -ForegroundColor White
Write-Host "3. اختبر المشاركة باستخدام Facebook Debugger" -ForegroundColor White
Write-Host ""
Write-Host "ملف dist جاهز للرفع! ✓" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
pause
