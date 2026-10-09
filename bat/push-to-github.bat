@echo off
echo ==============================================
echo Pushing Kavach AI to GitHub Repository...
echo URL: https://github.com/bickeypradhan/Kavach-AI
echo ==============================================
echo.

cd ..
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ==============================================
    echo SUCCESS! Kavach AI has been uploaded to GitHub!
    echo URL: https://github.com/bickeypradhan/Kavach-AI
    echo ==============================================
) else (
    echo.
    echo ==============================================
    echo If GitHub opened a browser window or login prompt,
    echo please authenticate to allow git push to complete.
    echo ==============================================
)
pause
