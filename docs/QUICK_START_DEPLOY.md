# Quick Start: Deploy from Zero

This is a condensed version for experienced users. For detailed instructions, see [DEPLOY_GCP.md](./DEPLOY_GCP.md).

## Prerequisites Checklist

- [ ] Google account
- [ ] Credit card (for billing, free tier available)
- [ ] gcloud CLI installed
- [ ] MongoDB Atlas account (free tier)

## Step-by-Step Commands

### 1. Create Project and Enable Billing

```bash
# Authenticate
gcloud auth login

# Create project
gcloud projects create surf-desempenho-api --name="Surf Desempenho API"
gcloud config set project surf-desempenho-api

# Enable billing (via console: https://console.cloud.google.com/billing)
# Then continue...
```

### 2. Enable APIs and Set Permissions

```bash
# Enable APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com containerregistry.googleapis.com storage-api.googleapis.com storage-component.googleapis.com

# Get project number
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"
```

### 3. Build Docker Image

```bash
cd surf-api
PROJECT_ID=$(gcloud config get-value project)
gcloud builds submit --tag gcr.io/$PROJECT_ID/surf-api:latest
```

### 4. Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up and create free M0 cluster
3. Create database user (save username and password)
4. Allow IP `0.0.0.0/0` in Network Access
5. Get connection string: "Connect" → "Connect your application"
6. Format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/surf-app?retryWrites=true&w=majority`

### 5. Configure Secret Manager

```bash
# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Create MongoDB URI secret
echo -n "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/surf-app?retryWrites=true&w=majority" | gcloud secrets create mongodb-uri --data-file=-

# Create JWT secret (Linux/Mac)
echo -n "$(openssl rand -base64 32)" | gcloud secrets create jwt-secret --data-file=-

# Create JWT secret (Windows PowerShell)
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
echo -n $jwtSecret | gcloud secrets create jwt-secret --data-file=-

# Grant Cloud Run access
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding mongodb-uri --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding jwt-secret --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
```

### 6. Deploy to Cloud Run

```bash
PROJECT_ID=$(gcloud config get-value project)

# Deploy with secrets (PORT is automatically set by Cloud Run)
gcloud run deploy surf-api \
  --image gcr.io/$PROJECT_ID/surf-api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --port 8080 \
  --set-env-vars "NODE_ENV=production,JWT_EXPIRES_IN=1d" \
  --set-secrets "MONGODB_URI=mongodb-uri:latest,JWT_SECRET=jwt-secret:latest"
```

### 6. Get API URL

```bash
gcloud run services describe surf-api --region us-central1 --format="value(status.url)"
```

**Done!** Use this URL in your app's `eas.json` or `.env.production`.
