@echo off
title StudyMind Command Center
color 0b
echo =======================================================================
echo               STUDYMIND: AI STUDY COPILOT ENGINE (BMSIT)
echo =======================================================================
echo.
echo [1/2] Launching dependency audit and synchronization checks...
call npm run install-all
echo.
echo [2/2] Booting backend gateway and Vite client frontend...
echo.
call npm start
pause
