@echo off
echo Starting Repolyx Development Environment...

echo Starting Server...
start "Repolyx Server" cmd /k "cd server && npm run dev"

echo Starting Client...
start "Repolyx Client" cmd /k "cd client && npm run dev"

echo Both services have been started in separate windows!
