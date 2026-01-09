# AWS ECS Deployment Guide

This guide explains how to deploy the DSM application to AWS ECS (Elastic Container Service) using ECR (Elastic Container Registry).

## Architecture Overview

```
┌─────────────────┐
│   CloudFront    │ (Optional CDN)
└────────┬────────┘
         │
┌────────▼────────┐     ┌──────────────────┐
│  Application    │────▶│   RDS PostgreSQL │
│  Load Balancer  │     │   (Managed DB)   │
└────────┬────────┘     └──────────────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Frontend│ │Backend│
│  ECS   │ │  ECS  │
└────────┘ └───────┘
```

## Prerequisites

1. **AWS CLI** installed and configured
   ```bash
   aws --version
   aws configure
   ```

2. **Docker** installed and running

3. **AWS Resources**:
   - ECS Cluster (Fargate)
   - RDS PostgreSQL instance
   - Application Load Balancer (optional but recommended)
   - IAM Roles for ECS execution and task
   - CloudWatch Log Groups
   - Secrets Manager (for database password)

## Setup Steps

### 1. Create AWS Resources

#### Create ECS Cluster
```bash
aws ecs create-cluster --cluster-name dsm-cluster --region us-east-1
```

#### Create RDS PostgreSQL Instance
```bash
aws rds create-db-instance \
  --db-instance-identifier dsm-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username dsmuser \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --region us-east-1
```

#### Create CloudWatch Log Groups
```bash
aws logs create-log-group --log-group-name /ecs/dsm-backend --region us-east-1
aws logs create-log-group --log-group-name /ecs/dsm-frontend --region us-east-1
```

#### Create Secrets Manager Secret for Database Password
```bash
aws secretsmanager create-secret \
  --name dsm/database/password \
  --secret-string "YOUR_SECURE_PASSWORD" \
  --region us-east-1
```

#### Create IAM Roles

Create `ecsTaskExecutionRole` with policies:
- `AmazonECSTaskExecutionRolePolicy`
- `SecretsManagerReadWrite` (to read database password)

Create `ecsTaskRole` for your application permissions.

### 2. Configure Task Definitions

Update the task definition files in `aws/` directory:

1. **`ecs-task-definition-backend.json`**:
   - Replace `YOUR_ACCOUNT_ID` with your AWS account ID
   - Replace `YOUR_REGION` with your AWS region
   - Replace `YOUR_RDS_ENDPOINT` with your RDS endpoint
   - Update IAM role ARNs
   - Update Secrets Manager ARN

2. **`ecs-task-definition-frontend.json`**:
   - Replace `YOUR_ACCOUNT_ID` with your AWS account ID
   - Replace `YOUR_REGION` with your AWS region
   - Update `REACT_APP_API_URL` with your backend URL
   - Update IAM role ARNs

### 3. Build and Push Images to ECR

```bash
# Set environment variables
export AWS_ACCOUNT_ID=your-account-id
export AWS_REGION=us-east-1
export REACT_APP_API_URL=https://api.yourdomain.com

# Make script executable
chmod +x aws/build-and-push.sh

# Build and push
./aws/build-and-push.sh
```

Or manually:

```bash
# Authenticate
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Create repositories
aws ecr create-repository --repository-name dsm-backend --region us-east-1
aws ecr create-repository --repository-name dsm-frontend --region us-east-1

# Build and push backend
docker build -t dsm-backend:latest -f backend/Dockerfile backend
docker tag dsm-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/dsm-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/dsm-backend:latest

# Build and push frontend
docker build --build-arg REACT_APP_API_URL=$REACT_APP_API_URL \
  -t dsm-frontend:latest -f frontend/Dockerfile frontend
docker tag dsm-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/dsm-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/dsm-frontend:latest
```

### 4. Register Task Definitions

```bash
aws ecs register-task-definition \
  --cli-input-json file://aws/ecs-task-definition-backend.json \
  --region us-east-1

aws ecs register-task-definition \
  --cli-input-json file://aws/ecs-task-definition-frontend.json \
  --region us-east-1
```

### 5. Create ECS Services

#### Backend Service
```bash
aws ecs create-service \
  --cluster dsm-cluster \
  --service-name dsm-backend-service \
  --task-definition dsm-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:region:account:targetgroup/backend-tg/xxx,containerName=dsm-backend,containerPort=8080" \
  --region us-east-1
```

#### Frontend Service
```bash
aws ecs create-service \
  --cluster dsm-cluster \
  --service-name dsm-frontend-service \
  --task-definition dsm-frontend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:region:account:targetgroup/frontend-tg/xxx,containerName=dsm-frontend,containerPort=80" \
  --region us-east-1
```

### 6. Deploy Updates

Use the deployment script:

```bash
chmod +x aws/deploy.sh
./aws/deploy.sh
```

Or deploy only one service:
```bash
./aws/deploy.sh backend-only
./aws/deploy.sh frontend-only
```

## Environment Variables

### Backend (via Task Definition)
- `SPRING_DATASOURCE_URL`: RDS connection string
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: From Secrets Manager
- `SPRING_JPA_HIBERNATE_DDL_AUTO`: `validate` (production) or `update` (dev)
- `SPRING_JPA_SHOW_SQL`: `false` (production)

### Frontend (via Task Definition)
- `REACT_APP_API_URL`: Backend API URL (must be set at build time)

## Security Best Practices

1. **Use Secrets Manager** for sensitive data (passwords, API keys)
2. **Enable encryption at rest** for RDS
3. **Use VPC** with private subnets for containers
4. **Enable HTTPS** with Application Load Balancer
5. **Use IAM roles** instead of hardcoded credentials
6. **Enable CloudWatch** logging and monitoring
7. **Set up AWS WAF** for DDoS protection

## Monitoring

### View Logs
```bash
# Backend logs
aws logs tail /ecs/dsm-backend --follow --region us-east-1

# Frontend logs
aws logs tail /ecs/dsm-frontend --follow --region us-east-1
```

### Check Service Status
```bash
aws ecs describe-services \
  --cluster dsm-cluster \
  --services dsm-backend-service dsm-frontend-service \
  --region us-east-1
```

### Check Task Status
```bash
aws ecs list-tasks --cluster dsm-cluster --region us-east-1
```

## Troubleshooting

### Task Fails to Start
- Check CloudWatch logs
- Verify IAM roles have correct permissions
- Check security group allows outbound traffic
- Verify Secrets Manager ARN is correct

### Can't Connect to Database
- Check security groups allow traffic from ECS to RDS
- Verify RDS endpoint is correct
- Check database credentials in Secrets Manager

### Frontend Can't Reach Backend
- Verify `REACT_APP_API_URL` is correct (must be set at build time)
- Check CORS settings in backend
- Verify load balancer configuration

## Cost Optimization

1. **Use Fargate Spot** for non-critical workloads
2. **Right-size** your tasks (CPU/memory)
3. **Enable auto-scaling** based on metrics
4. **Use RDS Reserved Instances** for long-term use
5. **Enable S3 lifecycle policies** for old ECR images

## CI/CD Integration

For automated deployments, integrate with:
- **GitHub Actions**
- **AWS CodePipeline**
- **GitLab CI/CD**
- **Jenkins**

Example GitHub Actions workflow can be added to `.github/workflows/deploy.yml`.
