@echo off
echo ============================================
echo Cash Out App - Simple GitHub Update
echo ============================================
echo.
echo This script will:
echo 1. Add all your changes
echo 2. Commit them with your message
echo 3. Push to GitHub
echo.
echo IMPORTANT: If you have spaces in your commit message,
echo use quotes around it.
echo.
set /p  msg=Enter commit message: 
echo.
echo Adding all changes...
git add .
echo Committing with message:  %msg%
git commit -m %msg%
echo Pushing to GitHub...
git push
echo.
echo ===== UPDATE COMPLETE! =====
echo Your files have been backed up to GitHub.
echo.
pause
