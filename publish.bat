@echo off
rem Script de publicación para Health Portal
cd /d "C:\Users\3701375\.gemini\antigravity\scratch\health-portal"

echo ==========================================
echo  Publicando cambios a GitHub / Vercel
echo ==========================================

echo [1/3] Agregando archivos...
git add .

echo [2/3] Creando commit...
git commit -m "feat: Add OCR Camera Scan and Smart Keyboards"

echo [3/3] Subiendo cambios...
git push

echo ==========================================
echo  Proceso finalizado. 
echo  Si no hubo errores rojo, tu app se actualizara en Vercel.
echo ==========================================
pause
