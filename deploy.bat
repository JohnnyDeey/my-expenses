@echo off
set "APP_DIR=C:\Users\johndamilola.s\MyExpensesApp"
set "SRC=C:\Users\johndamilola.s\my-expenses\index.html"
set "NODE=C:\Users\johndamilola.s\node-v22.11.0-win-x64\node-v22.11.0-win-x64"
set "JAVA_HOME=C:\Users\johndamilola.s\OpenJDK21U-jdk_x64_windows_hotspot_21.0.12_8\jdk-21.0.12+8"
set "ANDROID_HOME=C:\Users\johndamilola.s\android-sdk"
set "PATH=%NODE%;%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"

set /p VERSION="Enter version number (e.g. 2.5.3): "

echo Setting version %VERSION% everywhere...
powershell -NoProfile -ExecutionPolicy Bypass -File "%APP_DIR%\set-version.ps1" -Version "%VERSION%"
if errorlevel 1 ( echo Version update failed - build stopped. & pause & exit /b 1 )

echo Copying web files into the app...
copy /Y "%SRC%" "%APP_DIR%\www\index.html"
if exist "%APP_DIR%\www\sw.js" copy /Y "C:\Users\johndamilola.s\my-expenses\sw.js" "%APP_DIR%\www\sw.js"
echo Source version updated to %VERSION%

echo Syncing Capacitor...
cd /d "%APP_DIR%"
call "%NODE%\npx.cmd" cap sync android

echo Building APK...
cd android
call gradlew.bat assembleDebug
cd ..

echo Done! APK at: %APP_DIR%\android\app\build\outputs\apk\debug\app-debug.apk
pause
