cmd /c run_pm2_resurrect.bat
cmd /c run_pm2_start.bat
IF %ERRORLEVEL% NEQ 0 (echo ERROR && timeout /t 20 && exit)
timeout /t 20