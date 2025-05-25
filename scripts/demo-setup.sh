#!/bin/bash

# Demo Setup Script for DepremKit Notifications
# This script helps set up the environment for demo videos

echo "🎬 DepremKit Demo Setup Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: This script should be run from the project root directory"
    exit 1
fi

echo "📱 Starting the development server..."

# Start the Expo development server
if command -v npx &> /dev/null; then
    echo "🚀 Starting Expo development server..."
    echo ""
    echo "Demo Instructions:"
    echo "=================="
    echo "1. Once the app loads, go to the 'Notifications' tab"
    echo "2. Look for the yellow 'Test Mode (Demo)' section"
    echo "3. Use these buttons for your demo:"
    echo "   • 'Test Verileri Ekle' - Adds test items with various expiration dates"
    echo "   • '5s Test Bildirimi' - Shows notification in 5 seconds"
    echo "   • 'Hemen Kontrol Et' - Immediately checks for expired items"
    echo "   • 'Hızlı Test Serisi' - Multiple notifications at 10s, 20s, 30s, 45s"
    echo "   • 'Bildirimleri Temizle' - Cleans up all test notifications"
    echo ""
    echo "💡 Tip: Always clean up notifications after your demo!"
    echo "📖 See NOTIFICATION_TESTING_GUIDE.md for detailed instructions"
    echo ""
    
    npx expo start
else
    echo "❌ Error: npx not found. Please install Node.js and npm first."
    exit 1
fi
