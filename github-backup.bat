@echo off
echo ============================================
echo Cash Out App - GitHub Update
echo ============================================
echo.
echo This script will backup all your files to GitHub.
echo.

:getmessage
echo Step 1: Enter a commit message
echo (Keep it simple, like  Added new feature or Fixed bug)
echo.
set /p msg=Commit message: 

if  %msg%== (
    echo.
    echo ERROR: Commit message cannot be empty!
    echo Please enter a message.
    echo.
    goto getmessage
)

echo.
echo Step 2: Adding all changes to Git...
git add .
echo.
echo Step 3: Committing with your message...
git commit -m %msg%
echo.
echo Step 4: Pushing to GitHub...
git push
echo.
echo ============================================
echo SUCCESS! All files backed up to GitHub.
echo ============================================
echo.
echo Your commit: %msg%
echo Date: %date% %time%
echo.
pause
