@echo off
echo Stopping Repolyx Development Environment...

echo Killing processes on port 3000 (Client)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    taskkill /F /PID %%a
)

echo Killing processes on port 5000 (Server)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    taskkill /F /PID %%a
)

echo Services stopped successfully!
