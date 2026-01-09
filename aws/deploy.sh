#!/bin/bash

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
CLUSTER_NAME="${CLUSTER_NAME:-dsm-cluster}"
BACKEND_SERVICE="${BACKEND_SERVICE:-dsm-backend-service}"
FRONTEND_SERVICE="${FRONTEND_SERVICE:-dsm-frontend-service}"
BACKEND_TASK_DEF="${BACKEND_TASK_DEF:-dsm-backend}"
FRONTEND_TASK_DEF="${FRONTEND_TASK_DEF:-dsm-frontend}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Starting deployment...${NC}"
echo "Cluster: $CLUSTER_NAME"
echo "Region: $AWS_REGION"
echo ""

# Function to update task definition and service
deploy_service() {
    local service=$1
    local task_def=$2
    local task_def_file=$3
    
    echo -e "${YELLOW}=== Deploying $service ===${NC}"
    
    # Register new task definition
    echo "Registering new task definition..."
    aws ecs register-task-definition \
        --cli-input-json file://$task_def_file \
        --region $AWS_REGION > /dev/null
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to register task definition for $service${NC}"
        exit 1
    fi
    
    # Update service with new task definition
    echo "Updating ECS service..."
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service $service \
        --force-new-deployment \
        --region $AWS_REGION > /dev/null
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to update service $service${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ $service deployment initiated${NC}"
    echo ""
}

# Deploy backend
if [ "$1" != "frontend-only" ]; then
    deploy_service "$BACKEND_SERVICE" "$BACKEND_TASK_DEF" "aws/ecs-task-definition-backend.json"
fi

# Deploy frontend
if [ "$1" != "backend-only" ]; then
    deploy_service "$FRONTEND_SERVICE" "$FRONTEND_TASK_DEF" "aws/ecs-task-definition-frontend.json"
fi

echo -e "${GREEN}=== Deployment complete! ===${NC}"
echo ""
echo "Monitor deployment status:"
echo "  aws ecs describe-services --cluster $CLUSTER_NAME --services $BACKEND_SERVICE $FRONTEND_SERVICE --region $AWS_REGION"
