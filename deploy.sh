#!/bin/bash
set -e

# Configuration
PROJECT_ID="austin-test-450819"
REGION="us-west1"
REPO_NAME="game24-repo"
SERVICE_NAME="game24-app"
IMAGE_TAG="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_NAME:latest"

echo "Using Project ID: $PROJECT_ID"
echo "Region: $REGION"

# 1. Ensure Artifact Registry Repository exists
echo "Checking for Artifact Registry repository..."
if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION --project=$PROJECT_ID >/dev/null 2>&1; then
    echo "Creating repository $REPO_NAME..."
    gcloud artifacts repositories create $REPO_NAME \
        --repository-format=docker \
        --location=$REGION \
        --description="Docker repository for Game24" \
        --project=$PROJECT_ID
else
    echo "Repository $REPO_NAME already exists."
fi

# 2. Submit Build to Cloud Build
echo "Submitting build to Cloud Build..."
gcloud builds submit --tag $IMAGE_TAG --project=$PROJECT_ID .

# 3. Deploy to Cloud Run
echo "Deploying to Cloud Run..."
if [ -f "env.yaml" ]; then
    gcloud run deploy $SERVICE_NAME \
        --image $IMAGE_TAG \
        --platform managed \
        --region $REGION \
        --project $PROJECT_ID \
        --allow-unauthenticated \
        --env-vars-file=env.yaml
else
    echo "Warning: env.yaml not found. Deploying without environment variables."
    gcloud run deploy $SERVICE_NAME \
        --image $IMAGE_TAG \
        --platform managed \
        --region $REGION \
        --project $PROJECT_ID \
        --allow-unauthenticated
fi

echo "Deployment complete!"
