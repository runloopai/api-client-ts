#!/bin/bash

# Object-Oriented SDK Smoke Test Runner
# This script runs all object-oriented smoke tests with proper environment setup

set -e

echo "🚀 Running Object-Oriented SDK Smoke Tests"
echo "=========================================="

# Check for required environment variables
if [ -z "$RUNLOOP_API_KEY" ]; then
    echo "❌ Error: RUNLOOP_API_KEY environment variable is required"
    echo "   Please set your Runloop API key:"
    echo "   export RUNLOOP_API_KEY='your-api-key-here'"
    exit 1
fi

echo "✅ API Key found"
echo "🔧 Base URL: ${RUNLOOP_BASE_URL:-'https://api.runloop.ai (default)'}"

# Run the tests
echo ""
echo "🧪 Running tests..."
echo ""

# Run all object-oriented tests
npm test -- tests/smoketests/object-oriented/ --verbose

echo ""
echo "✅ All object-oriented smoke tests completed!"
echo ""
echo "📊 Test Summary:"
echo "   - SDK initialization and basic functionality"
echo "   - Devbox lifecycle and operations"
echo "   - Blueprint creation and management"
echo "   - Snapshot operations"
echo "   - Storage object lifecycle"
echo "   - Execution management"
echo "   - Integration workflows"
echo ""
echo "🎉 Object-oriented SDK is working correctly!"
