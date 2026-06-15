#!/bin/bash
# Quick Vercel Setup Script
# This script helps you deploy all three services to Vercel

set -e

echo "🚀 CraveStop Multi-Service Vercel Deployment"
echo "================================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ Vercel CLI found"
echo ""

# Function to deploy a service
deploy_service() {
    local service_name=$1
    local project_name=$2
    local service_path=$3

    echo "📦 Deploying $service_name..."
    echo "   Project: $project_name"
    echo "   Path: $service_path"
    
    cd "$service_path"
    vercel
    
    echo ""
    echo "✅ $service_name deployed successfully!"
    echo "   Remember to:"
    echo "   - Set up environment variables in Vercel dashboard"
    echo "   - Take note of the production URL"
    echo ""
}

# Deployment steps
read -p "Deploy CRM Backend? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    deploy_service "CRM Backend" "cravestop-backend" "./crm-backend"
fi

read -p "Deploy Channel Service? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    deploy_service "Channel Service" "cravestop-channels" "./channel-service"
fi

read -p "Deploy Frontend? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Deploying Frontend..."
    echo "   Project: cravestop-frontend"
    echo "   Path: ./frontend"
    
    cd "./frontend"
    
    # Prompt for API URLs
    read -p "Enter backend URL (e.g., https://cravestop-backend.vercel.app): " backend_url
    read -p "Enter channel service URL (e.g., https://cravestop-channels.vercel.app): " channel_url
    
    # Set environment variables before deployment
    vercel env add NEXT_PUBLIC_API_URL "$backend_url"
    vercel env add NEXT_PUBLIC_CHANNEL_SERVICE_URL "$channel_url"
    
    vercel
    
    echo ""
    echo "✅ Frontend deployed successfully!"
fi

echo ""
echo "🎉 All services deployed!"
echo ""
echo "📋 Next steps:"
echo "   1. Verify all services are running in Vercel dashboard"
echo "   2. Test the frontend at the provided URL"
echo "   3. Check that frontend can communicate with backend"
echo "   4. Consider migrating to a persistent database for production"
