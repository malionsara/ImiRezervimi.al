#!/bin/bash
# Local Testing Script for ImiRezervimi.al
# Provides easy commands for running tests locally during development

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR=$(dirname $(dirname $(realpath $0)))
FRONTEND_DIR="$PROJECT_DIR/frontend"
DEFAULT_BASE_URL="http://localhost:3000"
DEFAULT_BROWSER="chromium"

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if application is running
check_app_running() {
    local url=${1:-$DEFAULT_BASE_URL}
    if curl -f "$url/api/health" > /dev/null 2>&1; then
        log_success "Application is running at $url"
        return 0
    else
        log_error "Application is not running at $url"
        return 1
    fi
}

# Start the application if not running
start_app_if_needed() {
    local url=${1:-$DEFAULT_BASE_URL}
    
    if ! check_app_running "$url"; then
        if [[ "$url" == "http://localhost:3000" ]]; then
            log_info "Starting local development server..."
            cd "$FRONTEND_DIR"
            
            # Install dependencies if needed
            if [ ! -d "node_modules" ]; then
                log_info "Installing dependencies..."
                npm install
            fi
            
            # Start the server in background
            npm run dev > /dev/null 2>&1 &
            local server_pid=$!
            
            # Wait for server to start
            log_info "Waiting for server to start..."
            local max_attempts=30
            local attempt=0
            
            while ! check_app_running "$url" && [ $attempt -lt $max_attempts ]; do
                sleep 2
                ((attempt++))
            done
            
            if [ $attempt -eq $max_attempts ]; then
                log_error "Failed to start development server"
                kill $server_pid 2>/dev/null || true
                exit 1
            fi
            
            log_success "Development server started (PID: $server_pid)"
            echo $server_pid > "$PROJECT_DIR/.dev-server-pid"
        else
            log_error "Cannot start remote application. Please ensure it's running."
            exit 1
        fi
    fi
}

# Install dependencies and browsers
setup_tests() {
    log_info "Setting up test environment..."
    
    cd "$PROJECT_DIR"
    
    # Install npm dependencies
    if [ ! -d "node_modules" ]; then
        log_info "Installing npm dependencies..."
        npm install
    fi
    
    # Install Playwright browsers
    log_info "Installing Playwright browsers..."
    npx playwright install
    
    # Verify frontend dependencies
    cd "$FRONTEND_DIR"
    if [ ! -d "node_modules" ]; then
        log_info "Installing frontend dependencies..."
        npm install
    fi
    
    log_success "Test environment setup complete"
}

# Run specific test suite
run_test_suite() {
    local suite=$1
    local browser=${2:-$DEFAULT_BROWSER}
    local base_url=${3:-$DEFAULT_BASE_URL}
    local headed=${4:-false}
    
    cd "$PROJECT_DIR"
    
    local headed_flag=""
    if [[ "$headed" == "true" ]]; then
        headed_flag="--headed"
    fi
    
    log_info "Running $suite tests with $browser browser"
    log_info "Target URL: $base_url"
    
    case $suite in
        "all")
            BASE_URL="$base_url" npx playwright test --project="$browser" $headed_flag
            ;;
        "smoke")
            BASE_URL="$base_url" npx playwright test tests/homepage.spec.ts tests/authentication.spec.ts --project="$browser" $headed_flag
            ;;
        "homepage")
            BASE_URL="$base_url" npx playwright test tests/homepage.spec.ts --project="$browser" $headed_flag
            ;;
        "auth")
            BASE_URL="$base_url" npx playwright test tests/authentication.spec.ts --project="$browser" $headed_flag
            ;;
        "booking")
            BASE_URL="$base_url" npx playwright test tests/booking.spec.ts --project="$browser" $headed_flag
            ;;
        "salon")
            BASE_URL="$base_url" npx playwright test tests/salon-management.spec.ts --project="$browser" $headed_flag
            ;;
        "customer")
            BASE_URL="$base_url" npx playwright test tests/customer-dashboard.spec.ts --project="$browser" $headed_flag
            ;;
        "api")
            BASE_URL="$base_url" npx playwright test tests/api-endpoints.spec.ts --project="$browser" $headed_flag
            ;;
        "mobile")
            BASE_URL="$base_url" npx playwright test --project="Mobile Chrome" $headed_flag
            ;;
        *)
            log_error "Unknown test suite: $suite"
            log_info "Available suites: all, smoke, homepage, auth, booking, salon, customer, api, mobile"
            exit 1
            ;;
    esac
}

# Debug a specific test
debug_test() {
    local test_file=$1
    local test_name=$2
    local base_url=${3:-$DEFAULT_BASE_URL}
    
    cd "$PROJECT_DIR"
    
    log_info "Debugging test: $test_file"
    if [[ -n "$test_name" ]]; then
        log_info "Test name pattern: $test_name"
        BASE_URL="$base_url" npx playwright test "$test_file" -g "$test_name" --debug
    else
        BASE_URL="$base_url" npx playwright test "$test_file" --debug
    fi
}

# Generate test report
generate_report() {
    cd "$PROJECT_DIR"
    
    log_info "Generating test report..."
    npx playwright show-report
}

# Clean up test artifacts
cleanup() {
    cd "$PROJECT_DIR"
    
    log_info "Cleaning up test artifacts..."
    
    # Remove test results
    rm -rf test-results/ playwright-report/ deployment-test-report-*
    
    # Stop development server if running
    if [ -f ".dev-server-pid" ]; then
        local pid=$(cat .dev-server-pid)
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            log_info "Stopped development server (PID: $pid)"
        fi
        rm .dev-server-pid
    fi
    
    log_success "Cleanup complete"
}

# Show usage information
show_usage() {
    echo "🧪 ImiRezervimi.al Local Testing Script"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  setup                           Set up test environment (install dependencies and browsers)"
    echo "  test <suite> [browser] [url]    Run test suite"
    echo "  debug <file> [test_name] [url]  Debug specific test"
    echo "  report                          Open test report"
    echo "  cleanup                         Clean up test artifacts"
    echo "  check [url]                     Check if application is running"
    echo "  start                           Start local development server"
    echo ""
    echo "Test Suites:"
    echo "  all        - Run all tests"
    echo "  smoke      - Run critical tests only"
    echo "  homepage   - Homepage and navigation tests"
    echo "  auth       - Authentication flow tests"
    echo "  booking    - Booking workflow tests"
    echo "  salon      - Salon management tests"
    echo "  customer   - Customer dashboard tests"
    echo "  api        - API endpoint tests"
    echo "  mobile     - Mobile device tests"
    echo ""
    echo "Browsers:"
    echo "  chromium   - Default"
    echo "  firefox    - Firefox browser"
    echo "  webkit     - Safari/WebKit browser"
    echo ""
    echo "Examples:"
    echo "  $0 setup"
    echo "  $0 test all"
    echo "  $0 test smoke chromium"
    echo "  $0 test booking firefox http://localhost:3000"
    echo "  $0 debug tests/booking.spec.ts \"should complete full booking\""
    echo "  $0 test api chromium https://imirezervimi.al"
    echo ""
    echo "Environment Variables:"
    echo "  BASE_URL              - Override application URL"
    echo "  TEST_USER_PHONE       - Test user phone number"
    echo "  HEADLESS              - Run tests in headless mode (true/false)"
    echo ""
}

# Main command handling
main() {
    local command=${1:-""}
    
    case $command in
        "setup")
            setup_tests
            ;;
        "test")
            local suite=${2:-"all"}
            local browser=${3:-$DEFAULT_BROWSER}
            local url=${4:-$DEFAULT_BASE_URL}
            local headed="false"
            
            if [[ "${HEADLESS:-true}" == "false" ]]; then
                headed="true"
            fi
            
            start_app_if_needed "$url"
            run_test_suite "$suite" "$browser" "$url" "$headed"
            ;;
        "debug")
            local test_file=${2:-""}
            local test_name=${3:-""}
            local url=${4:-$DEFAULT_BASE_URL}
            
            if [[ -z "$test_file" ]]; then
                log_error "Test file is required for debug command"
                show_usage
                exit 1
            fi
            
            start_app_if_needed "$url"
            debug_test "$test_file" "$test_name" "$url"
            ;;
        "report")
            generate_report
            ;;
        "cleanup")
            cleanup
            ;;
        "check")
            local url=${2:-$DEFAULT_BASE_URL}
            check_app_running "$url"
            ;;
        "start")
            start_app_if_needed
            ;;
        "help"|"--help"|"-h"|"")
            show_usage
            ;;
        *)
            log_error "Unknown command: $command"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"