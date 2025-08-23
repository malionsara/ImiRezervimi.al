@echo off
REM Local Testing Script for ImiRezervimi.al (Windows)
REM Provides easy commands for running tests locally during development

setlocal enabledelayedexpansion

REM Configuration
set "PROJECT_DIR=%~dp0.."
set "FRONTEND_DIR=%PROJECT_DIR%\frontend"
set "DEFAULT_BASE_URL=http://localhost:3000"
set "DEFAULT_BROWSER=chromium"

REM Helper functions
:log_info
    echo [INFO] %~1
    goto :eof

:log_success
    echo [SUCCESS] %~1
    goto :eof

:log_warning
    echo [WARNING] %~1
    goto :eof

:log_error
    echo [ERROR] %~1
    goto :eof

REM Check if application is running
:check_app_running
    set "url=%~1"
    if "%url%"=="" set "url=%DEFAULT_BASE_URL%"
    
    curl -f "%url%/api/health" >nul 2>&1
    if !errorlevel! equ 0 (
        call :log_success "Application is running at %url%"
        exit /b 0
    ) else (
        call :log_error "Application is not running at %url%"
        exit /b 1
    )

REM Start the application if not running
:start_app_if_needed
    set "url=%~1"
    if "%url%"=="" set "url=%DEFAULT_BASE_URL%"
    
    call :check_app_running "%url%"
    if !errorlevel! neq 0 (
        if "%url%"=="%DEFAULT_BASE_URL%" (
            call :log_info "Starting local development server..."
            cd /d "%FRONTEND_DIR%"
            
            REM Install dependencies if needed
            if not exist "node_modules" (
                call :log_info "Installing dependencies..."
                npm install
            )
            
            REM Start the server
            call :log_info "Starting development server..."
            start /b npm run dev
            
            REM Wait for server to start
            call :log_info "Waiting for server to start..."
            set "max_attempts=30"
            set "attempt=0"
            
            :wait_loop
            timeout /t 2 /nobreak >nul
            call :check_app_running "%url%"
            if !errorlevel! equ 0 goto :server_started
            
            set /a attempt+=1
            if !attempt! lss !max_attempts! goto :wait_loop
            
            call :log_error "Failed to start development server"
            exit /b 1
            
            :server_started
            call :log_success "Development server started"
        ) else (
            call :log_error "Cannot start remote application. Please ensure it's running."
            exit /b 1
        )
    )
    exit /b 0

REM Install dependencies and browsers
:setup_tests
    call :log_info "Setting up test environment..."
    
    cd /d "%PROJECT_DIR%"
    
    REM Install npm dependencies
    if not exist "node_modules" (
        call :log_info "Installing npm dependencies..."
        npm install
    )
    
    REM Install Playwright browsers
    call :log_info "Installing Playwright browsers..."
    npx playwright install
    
    REM Verify frontend dependencies
    cd /d "%FRONTEND_DIR%"
    if not exist "node_modules" (
        call :log_info "Installing frontend dependencies..."
        npm install
    )
    
    call :log_success "Test environment setup complete"
    exit /b 0

REM Run specific test suite
:run_test_suite
    set "suite=%~1"
    set "browser=%~2"
    set "base_url=%~3"
    set "headed=%~4"
    
    if "%browser%"=="" set "browser=%DEFAULT_BROWSER%"
    if "%base_url%"=="" set "base_url=%DEFAULT_BASE_URL%"
    
    cd /d "%PROJECT_DIR%"
    
    set "headed_flag="
    if "%headed%"=="true" set "headed_flag=--headed"
    
    call :log_info "Running %suite% tests with %browser% browser"
    call :log_info "Target URL: %base_url%"
    
    set "BASE_URL=%base_url%"
    
    if "%suite%"=="all" (
        npx playwright test --project="%browser%" %headed_flag%
    ) else if "%suite%"=="smoke" (
        npx playwright test tests/homepage.spec.ts tests/authentication.spec.ts --project="%browser%" %headed_flag%
    ) else if "%suite%"=="homepage" (
        npx playwright test tests/homepage.spec.ts --project="%browser%" %headed_flag%
    ) else if "%suite%"=="auth" (
        npx playwright test tests/authentication.spec.ts --project="%browser%" %headed_flag%
    ) else if "%suite%"=="booking" (
        npx playwright test tests/booking.spec.ts --project="%browser%" %headed_flag%
    ) else if "%suite%"=="salon" (
        npx playwright test tests/salon-management.spec.ts --project="%browser%" %headed_flag%
    ) else if "%suite%"=="customer" (
        npx playwright test tests/customer-dashboard.spec.ts --project="%browser%" %headed_flag%
    ) else if "%suite%"=="api" (
        npx playwright test tests/api-endpoints.spec.ts --project="%browser%" %headed_flag%
    ) else if "%suite%"=="mobile" (
        npx playwright test --project="Mobile Chrome" %headed_flag%
    ) else (
        call :log_error "Unknown test suite: %suite%"
        call :log_info "Available suites: all, smoke, homepage, auth, booking, salon, customer, api, mobile"
        exit /b 1
    )
    
    exit /b %errorlevel%

REM Debug a specific test
:debug_test
    set "test_file=%~1"
    set "test_name=%~2"
    set "base_url=%~3"
    
    if "%base_url%"=="" set "base_url=%DEFAULT_BASE_URL%"
    
    cd /d "%PROJECT_DIR%"
    
    call :log_info "Debugging test: %test_file%"
    set "BASE_URL=%base_url%"
    
    if not "%test_name%"=="" (
        call :log_info "Test name pattern: %test_name%"
        npx playwright test "%test_file%" -g "%test_name%" --debug
    ) else (
        npx playwright test "%test_file%" --debug
    )
    
    exit /b %errorlevel%

REM Generate test report
:generate_report
    cd /d "%PROJECT_DIR%"
    
    call :log_info "Generating test report..."
    npx playwright show-report
    exit /b 0

REM Clean up test artifacts
:cleanup
    cd /d "%PROJECT_DIR%"
    
    call :log_info "Cleaning up test artifacts..."
    
    REM Remove test results
    if exist "test-results" rmdir /s /q "test-results"
    if exist "playwright-report" rmdir /s /q "playwright-report"
    del /q deployment-test-report-* 2>nul
    
    REM Stop any running Node.js processes (development server)
    taskkill /f /im node.exe 2>nul
    
    call :log_success "Cleanup complete"
    exit /b 0

REM Show usage information
:show_usage
    echo.
    echo 🧪 ImiRezervimi.al Local Testing Script (Windows)
    echo.
    echo Usage: %~nx0 ^<command^> [options]
    echo.
    echo Commands:
    echo   setup                           Set up test environment (install dependencies and browsers)
    echo   test ^<suite^> [browser] [url]    Run test suite
    echo   debug ^<file^> [test_name] [url]  Debug specific test
    echo   report                          Open test report
    echo   cleanup                         Clean up test artifacts
    echo   check [url]                     Check if application is running
    echo   start                           Start local development server
    echo.
    echo Test Suites:
    echo   all        - Run all tests
    echo   smoke      - Run critical tests only
    echo   homepage   - Homepage and navigation tests
    echo   auth       - Authentication flow tests
    echo   booking    - Booking workflow tests
    echo   salon      - Salon management tests
    echo   customer   - Customer dashboard tests
    echo   api        - API endpoint tests
    echo   mobile     - Mobile device tests
    echo.
    echo Browsers:
    echo   chromium   - Default
    echo   firefox    - Firefox browser
    echo   webkit     - Safari/WebKit browser
    echo.
    echo Examples:
    echo   %~nx0 setup
    echo   %~nx0 test all
    echo   %~nx0 test smoke chromium
    echo   %~nx0 test booking firefox http://localhost:3000
    echo   %~nx0 debug tests/booking.spec.ts "should complete full booking"
    echo   %~nx0 test api chromium https://imirezervimi.al
    echo.
    echo Environment Variables:
    echo   BASE_URL              - Override application URL
    echo   TEST_USER_PHONE       - Test user phone number
    echo   HEADLESS              - Run tests in headless mode (true/false)
    echo.
    exit /b 0

REM Main command handling
:main
    set "command=%~1"
    
    if "%command%"=="setup" (
        call :setup_tests
    ) else if "%command%"=="test" (
        set "suite=%~2"
        set "browser=%~3"
        set "url=%~4"
        set "headed=false"
        
        if "%suite%"=="" set "suite=all"
        
        if /i "%HEADLESS%"=="false" set "headed=true"
        
        call :start_app_if_needed "%url%"
        if !errorlevel! neq 0 exit /b 1
        
        call :run_test_suite "%suite%" "%browser%" "%url%" "%headed%"
    ) else if "%command%"=="debug" (
        set "test_file=%~2"
        set "test_name=%~3"
        set "url=%~4"
        
        if "%test_file%"=="" (
            call :log_error "Test file is required for debug command"
            call :show_usage
            exit /b 1
        )
        
        call :start_app_if_needed "%url%"
        if !errorlevel! neq 0 exit /b 1
        
        call :debug_test "%test_file%" "%test_name%" "%url%"
    ) else if "%command%"=="report" (
        call :generate_report
    ) else if "%command%"=="cleanup" (
        call :cleanup
    ) else if "%command%"=="check" (
        set "url=%~2"
        call :check_app_running "%url%"
    ) else if "%command%"=="start" (
        call :start_app_if_needed
    ) else if "%command%"=="help" (
        call :show_usage
    ) else if "%command%"=="--help" (
        call :show_usage
    ) else if "%command%"=="-h" (
        call :show_usage
    ) else if "%command%"=="" (
        call :show_usage
    ) else (
        call :log_error "Unknown command: %command%"
        echo.
        call :show_usage
        exit /b 1
    )
    
    exit /b %errorlevel%

REM Execute main function
call :main %*
exit /b %errorlevel%