#!/bin/bash

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-}"
ECR_BACKEND_REPO="${ECR_BACKEND_REPO:-dsm-backend}"
ECR_FRONTEND_REPO="${ECR_FRONTEND_REPO:-dsm-frontend}"
BACKEND_TAG="${BACKEND_TAG:-latest}"
FRONTEND_TAG="${FRONTEND_TAG:-latest}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS credentials are configured
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo -e "${RED}Error: AWS_ACCOUNT_ID is not set${NC}"
    echo "Set it with: export AWS_ACCOUNT_ID=your-account-id"
    exit 1
fi

echo -e "${GREEN}Starting build and push process...${NC}"
echo "AWS Account: $AWS_ACCOUNT_ID"
echo "AWS Region: $AWS_REGION"
echo ""

# Function to build and push Docker image
build_and_push() {
    local service=$1
    local repo=$2
    local tag=$3
    local dockerfile=$4
    local context=$5
    local build_args=$6
    
    echo -e "${YELLOW}=== Building $service ===${NC}"
    
    # Get login token and authenticate Docker client to ECR
    echo "Authenticating with ECR..."
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    
    # Create repository if it doesn't exist
    echo "Checking if repository exists..."
    if ! aws ecr describe-repositories --repository-names $repo --region $AWS_REGION > /dev/null 2>&1; then
        echo "Creating ECR repository: $repo"
        aws ecr create-repository --repository-name $repo --region $AWS_REGION
    fi
    
    # Build Docker image
    local image_uri="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$repo:$tag"
    echo "Building image: $image_uri"
    
    if [ -n "$build_args" ]; then
        docker build -t $image_uri -f $dockerfile $build_args $context
    else
        docker build -t $image_uri -f $dockerfile $context
    fi
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Build failed for $service${NC}"
        exit 1
    fi
    
    # Push image to ECR
    echo "Pushing image to ECR..."
    docker push $image_uri
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Push failed for $service${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Successfully built and pushed $service${NC}"
    echo ""
}

# Build and push backend
build_and_push "Backend" \
    "$ECR_BACKEND_REPO" \
    "$BACKEND_TAG" \
    "backend/Dockerfile" \
    "backend" \
    ""

# Build and push frontend
# Get API URL from environment or use default
API_URL="${REACT_APP_API_URL:-http://localhost:8080}"
build_and_push "Frontend" \
    "$ECR_FRONTEND_REPO" \
    "$FRONTEND_TAG" \
    "frontend/Dockerfile" \
    "frontend" \
    "--build-arg REACT_APP_API_URL=$API_URL"

echo -e "${GREEN}=== All images built and pushed successfully! ===${NC}"
echo ""
echo "Backend image: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND_REPO:$BACKEND_TAG"
echo "Frontend image: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_FRONTEND_REPO:$FRONTEND_TAG"
