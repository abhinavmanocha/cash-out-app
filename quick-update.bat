@echo off
echo ============================================
echo Cash Out App - Quick GitHub Update
echo ============================================
echo.
echo This will update all files with timestamp.
echo.
for /f  tokens=1-4 delims=/  %%a in ( %date%) do (
    set day=%%a
    set month=%%b
    set year=%%c
)
for /f tokens=1-3 delims=:. %%a in (%time%) do (
    set hour=%%a
    set minute=%%b
    set second=%%c
)
set timestamp=%year%-%month%-%day%_%hour%-%minute%-%second%
echo Adding all changes...
git add .
echo Committing with timestamp: %timestamp%
git commit -m Auto-update: %timestamp%
echo Pushing to GitHub...
git push
echo.
echo ===== UPDATE COMPLETE! =====
echo Your files have been backed up to GitHub.
echo.
pause
