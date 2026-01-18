#!/bin/bash

# Production API Test Script
# Usage: ./test_api.sh

BASE_URL="https://seemycampus.com"

echo "=========================================="
echo "Testing SeeMyCampus Production API"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Daily QR Code (Public)
echo -e "${YELLOW}Test 1: Daily QR Code (Public Endpoint)${NC}"
response=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/attendance/daily-qr/public")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Success (HTTP $http_code)${NC}"
    echo "Response: $body" | head -c 200
    echo "..."
else
    echo -e "${RED}✗ Failed (HTTP $http_code)${NC}"
    echo "Response: $body"
fi
echo ""

# Test 2: CORS Preflight
echo -e "${YELLOW}Test 2: CORS Preflight (OPTIONS)${NC}"
response=$(curl -s -w "\n%{http_code}" -X OPTIONS "${BASE_URL}/api/attendance/login" \
  -H "Origin: ${BASE_URL}" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type")
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ CORS Preflight Success (HTTP $http_code)${NC}"
else
    echo -e "${RED}✗ CORS Preflight Failed (HTTP $http_code)${NC}"
fi
echo ""

# Test 3: Login Endpoint (with test credentials)
echo -e "${YELLOW}Test 3: Login Endpoint${NC}"
echo "Enter test email (or press Enter for test@test.com):"
read -r email
email=${email:-test@test.com}

echo "Enter test password (or press Enter for test123):"
read -r password
password=${password:-test123}

response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/attendance/login" \
  -H "Content-Type: application/json" \
  -H "Origin: ${BASE_URL}" \
  -d "{\"email\":\"$email\",\"password\":\"$password\"}")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Login Success (HTTP $http_code)${NC}"
    echo "Response: $body" | head -c 300
    echo "..."
    
    # Extract token if present
    token=$(echo "$body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    if [ -n "$token" ]; then
        echo -e "${GREEN}Token received: ${token:0:20}...${NC}"
    fi
else
    echo -e "${RED}✗ Login Failed (HTTP $http_code)${NC}"
    echo "Response: $body"
fi
echo ""

# Test 4: API Health Check (if you have one)
echo -e "${YELLOW}Test 4: API Health Check${NC}"
response=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/health" 2>/dev/null || echo "404")
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 404 ]; then
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✓ Health Check Available${NC}"
    else
        echo -e "${YELLOW}⚠ Health Check Endpoint Not Found (This is OK if not implemented)${NC}"
    fi
else
    echo -e "${RED}✗ Health Check Failed (HTTP $http_code)${NC}"
fi
echo ""

echo "=========================================="
echo "Testing Complete"
echo "=========================================="
