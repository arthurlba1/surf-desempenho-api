# Deploy API to Google Cloud Platform (Cloud Run)

This guide walks through deploying the Surf Desempenho API to Google Cloud Run, starting from scratch.

## Prerequisites

1. **Google Account**: You'll need a Google account (Gmail)
2. **Credit Card**: Required for billing (free tier available, won't charge unless you exceed limits)
3. **Google Cloud SDK**: Install `gcloud` CLI
   - Windows: Download from https://cloud.google.com/sdk/docs/install
   - macOS: `brew install google-cloud-sdk`
   - Linux: Follow https://cloud.google.com/sdk/docs/install
4. **Docker**: Install Docker Desktop or Docker Engine (optional, if using local build)
5. **MongoDB**: Set up MongoDB Atlas account (free tier available)

## Step 1: Create Google Cloud Account and Project

### 1.1 Create Google Cloud Account

1. Go to https://console.cloud.google.com
2. Sign in with your Google account
3. Accept the terms of service
4. **Enable billing** (required, but free tier available):
   - Click on the billing icon in the top bar
   - Click "Link a billing account"
   - Add a payment method (credit card)
   - **Note**: You won't be charged unless you exceed the free tier limits

### 1.2 Create a New Project

**Via Console (Recommended for first time):**

1. In the Google Cloud Console, click the project dropdown at the top
2. Click "New Project"
3. Enter project name: `surf-desempenho-api`
4. Click "Create"
5. Wait for the project to be created (takes a few seconds)

**Via CLI (Alternative):**

```bash
# Authenticate with Google Cloud
gcloud auth login

# Create new project
gcloud projects create surf-desempenho-api --name="Surf Desempenho API"

# Set active project
gcloud config set project surf-desempenho-api
```

**Get your Project ID:**

After creating the project, note your **Project ID** (different from project name):
- In the console, it's shown in the project dropdown
- Via CLI: `gcloud config get-value project`

**Important**: The Project ID is unique and cannot be changed. It looks like: `surf-desempenho-api-123456` or `project-a6a2d577-aa45-4dae-9c8`

### 1.3 Link Billing Account to Project

1. Go to https://console.cloud.google.com/billing
2. Select your project: `surf-desempenho-api`
3. Click "Link a billing account"
4. Select or create a billing account
5. Confirm the link

**Note**: Without billing, Cloud Build won't work (it's required even for free tier usage).

### 1.4 Install and Configure gcloud CLI

**Windows:**
1. Download from: https://cloud.google.com/sdk/docs/install
2. Run the installer
3. Open PowerShell or Command Prompt
4. Run: `gcloud init`

**macOS:**
```bash
brew install google-cloud-sdk
gcloud init
```

**Linux:**
```bash
# Follow instructions at: https://cloud.google.com/sdk/docs/install
gcloud init
```

**Initial Configuration:**

```bash
# Authenticate
gcloud auth login

# Select your project
gcloud config set project surf-desempenho-api

# Verify configuration
gcloud config list
```

### 1.5 Verify Project Setup

```bash
# Check current project
gcloud config get-value project

# Get project number (needed for permissions)
gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)"
```

Save the **Project ID** and **Project Number** - you'll need them later.

### 1.3 Enable Required APIs

```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable storage-api.googleapis.com
gcloud services enable storage-component.googleapis.com
```

### 1.4 Grant Cloud Build Permissions

The Cloud Build service account needs permissions to access Google Cloud Storage. Grant the necessary roles:

```bash
# Get your project number
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

# Grant Storage Admin role to Cloud Build service account
gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/storage.admin"

# Grant Service Account User role (needed for Cloud Run deployment)
gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

**Note**: If you get a permission error, make sure:
1. You have the "Owner" or "Editor" role on the project
2. Billing is enabled for your project (required for Cloud Build)
3. All APIs are enabled (see Step 1.3)

## Step 2: Build and Push Docker Image

### Option A: Using Docker (Local Build)

```bash
# Navigate to API directory
cd surf-api

# First, get your project ID
gcloud config get-value project

# Build Docker image (replace PROJECT_ID with your actual project ID)
docker build -t gcr.io/PROJECT_ID/surf-api:latest .

# Configure Docker to use gcloud as credential helper
gcloud auth configure-docker

# Push image to Google Container Registry
docker push gcr.io/PROJECT_ID/surf-api:latest
```

### Option B: Using Cloud Build (Recommended)

```bash
# Navigate to API directory
cd surf-api

# First, get your project ID
gcloud config get-value project

# Build and push in one command (replace PROJECT_ID with your actual project ID)
gcloud builds submit --tag gcr.io/PROJECT_ID/surf-api:latest
```

**Important**: Replace `PROJECT_ID` with your actual Google Cloud project ID. You can find it with:
```bash
gcloud config get-value project
```

**Note**: Make sure to use `gcr.io` (not `grc.io`). The format is:
- `gcr.io/PROJECT_ID/image-name:tag`

This automatically builds and pushes the image to Google Container Registry.

## Step 3: Configure Google Secret Manager

Before deploying to Cloud Run, we need to store sensitive values (MongoDB URI and JWT secret) in Secret Manager.

### 3.1 Create MongoDB URI Secret

```bash
# Replace with your actual MongoDB Atlas connection string from Step 6
echo -n "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/surf-app?retryWrites=true&w=majority" | gcloud secrets create mongodb-uri --data-file=-
```

**Windows PowerShell:**
```powershell
# Replace with your actual MongoDB Atlas connection string
$mongodbUri = "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/surf-app?retryWrites=true&w=majority"
echo -n $mongodbUri | gcloud secrets create mongodb-uri --data-file=-
```

### 3.2 Create JWT Secret

Generate a secure random JWT secret (minimum 32 characters):

**Linux/Mac:**
```bash
echo -n "$(openssl rand -base64 32)" | gcloud secrets create jwt-secret --data-file=-
```

**Windows PowerShell:**
```powershell
# Generate secure random string (32 characters)
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
echo -n $jwtSecret | gcloud secrets create jwt-secret --data-file=-
```

**Note**: Save the JWT secret if you generated it manually. You can view it later with:
```bash
gcloud secrets versions access latest --secret="jwt-secret"
```

### 3.3 Grant Cloud Run Access to Secrets

The Cloud Run service account needs permission to read secrets:

```bash
# Get project number
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

# Grant access to mongodb-uri secret
gcloud secrets add-iam-policy-binding mongodb-uri \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Grant access to jwt-secret
gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

**Windows PowerShell:**
```powershell
# Get project number
$PROJECT_NUMBER = gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)"

# Grant access to secrets
gcloud secrets add-iam-policy-binding mongodb-uri --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding jwt-secret --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
```

### 3.4 Verify Secrets

```bash
# List all secrets
gcloud secrets list

# Verify secret access
gcloud secrets versions access latest --secret="mongodb-uri"
gcloud secrets versions access latest --secret="jwt-secret"
```

## Step 4: Deploy to Cloud Run

### 3.1 Basic Deployment

```bash
gcloud run deploy surf-api \
  --image gcr.io/PROJECT_ID/surf-api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --port 8080
```

### 4.1 Deploy with Environment Variables and Secrets

**Important**: `PORT` is automatically set by Cloud Run (default: 8080) and cannot be set manually. Do not include `PORT` in `--set-env-vars`.

```bash
# Get your project ID
PROJECT_ID=$(gcloud config get-value project)

# Deploy with secrets from Secret Manager
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

**Windows PowerShell:**
```powershell
# Get your project ID
$PROJECT_ID = gcloud config get-value project

# Deploy with secrets
gcloud run deploy surf-api --image "gcr.io/$PROJECT_ID/surf-api:latest" --platform managed --region us-central1 --allow-unauthenticated --memory 512Mi --cpu 1 --max-instances 10 --port 8080 --set-env-vars "NODE_ENV=production,JWT_EXPIRES_IN=1d" --set-secrets "MONGODB_URI=mongodb-uri:latest,JWT_SECRET=jwt-secret:latest"
```

**What this does:**
- Deploys the Docker image from Container Registry
- Sets `NODE_ENV=production` and `JWT_EXPIRES_IN=1d` as environment variables
- Loads `MONGODB_URI` and `JWT_SECRET` from Secret Manager
- Cloud Run automatically sets `PORT=8080` (you don't need to specify it)

### 4.2 Alternative: Deploy with Simple Environment Variables (Not Recommended for Production)

If you prefer to use environment variables directly instead of Secret Manager:

```bash
PROJECT_ID=$(gcloud config get-value project)

gcloud run deploy surf-api \
  --image gcr.io/$PROJECT_ID/surf-api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --port 8080 \
  --set-env-vars "NODE_ENV=production,JWT_EXPIRES_IN=1d,MONGODB_URI=YOUR_MONGODB_URI_HERE,JWT_SECRET=YOUR_JWT_SECRET_HERE"
```

**Warning**: This exposes sensitive values in the Cloud Run service configuration. Use Secret Manager for production.

## Step 5: Domain Configuration

### 5.1 Get Default URL

After deployment, Cloud Run provides a default URL. See Step 7.1 for instructions on how to get it.

You can use this URL directly, or map a custom domain.

### 5.2 Map Custom Domain (Optional)

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service surf-api \
  --domain api.surfdesempenho.com \
  --region us-central1
```

Follow the DNS configuration instructions provided by GCP. Typically:
- Add a CNAME record pointing to the Cloud Run domain
- SSL certificate is automatically provisioned by Google

## Step 6: MongoDB Atlas Setup

### 6.1 Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" or "Sign Up"
3. Sign up with your email (free tier available)
4. Verify your email address

### 6.2 Create a Free Cluster

1. After signing in, click "Build a Database"
2. Select **M0 Free** tier (512MB storage, shared RAM)
3. Choose a cloud provider: **Google Cloud**
4. Select a region close to your Cloud Run region (e.g., `us-central1`)
5. Click "Create"
6. Wait for the cluster to be created (takes 3-5 minutes)

### 6.3 Create Database User

1. In the "Database Access" section (left sidebar), click "Add New Database User"
2. Choose "Password" authentication method
3. Enter a username (e.g., `surf-admin`)
4. Click "Autogenerate Secure Password" or create your own
5. **Save the password securely** - you'll need it for the connection string
6. Set privileges to "Atlas admin" (or create custom role with read/write access)
7. Click "Add User"

**Important**: Save both username and password - you'll need them for the connection string.

### 6.4 Configure Network Access

1. In the "Network Access" section (left sidebar), click "Add IP Address"
2. For Cloud Run, you need to allow all IPs initially (Cloud Run uses dynamic IPs):
   - Click "Allow Access from Anywhere"
   - Or manually add `0.0.0.0/0` and click "Confirm"
3. Click "Confirm" to save

**Security Note**: Allowing `0.0.0.0/0` means any IP can access your database. This is acceptable for Cloud Run since:
- Your database requires authentication (username/password)
- You can restrict access later using MongoDB Atlas IP whitelist or VPC peering

### 6.5 Get Connection String

1. In the "Database" section, click "Connect" on your cluster
2. Choose "Connect your application"
3. Select driver: **Node.js** and version: **5.5 or later**
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your actual database user credentials
6. Add the database name: Replace `?retryWrites=true&w=majority` with `/surf-app?retryWrites=true&w=majority`

**Final connection string format:**
```
mongodb+srv://surf-admin:your-password@cluster0.xxxxx.mongodb.net/surf-app?retryWrites=true&w=majority
```

**Important**: 
- Database name must be `surf-app` (as configured in `app.module.ts`)
- Make sure there are no spaces in the connection string
- Save this connection string - you'll use it in Step 7 (Secret Manager)

### 6.6 Test Connection (Optional)

You can test the connection string locally before deploying:

```bash
# Install MongoDB shell (optional)
# Then test:
mongosh "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/surf-app"
```

### Option B: Self-Hosted MongoDB (Advanced)

1. Deploy MongoDB on Google Compute Engine
2. Configure firewall rules
3. Set up connection string

**Note**: For production, MongoDB Atlas is recommended as it handles backups, scaling, and maintenance automatically.

## Step 7: Verify Deployment

### 7.1 Get Service URL

After deployment, Cloud Run provides a default URL. You can find it:

**Via Console:**
1. Go to https://console.cloud.google.com/run
2. Click on your service `surf-api`
3. The URL is shown at the top (e.g., `https://surf-api-xxxxx-uc.a.run.app`)

**Via CLI:**
```bash
gcloud run services describe surf-api --region us-central1 --format="value(status.url)"
```

**Example output:**
```
https://surf-api-xxxxx-uc.a.run.app
```

**Save this URL** - you'll need it for the app configuration.

### 7.2 Test API Endpoints

```bash
# Get the URL first
API_URL=$(gcloud run services describe surf-api --region us-central1 --format="value(status.url)")

# Test Swagger docs
curl $API_URL/docs

# Test health endpoint (if exists)
curl $API_URL/api/health
```

### 7.3 Check Service Logs

```bash
gcloud run services logs read surf-api --region us-central1 --limit 50
```

**What to look for:**
- No MongoDB connection errors
- Application started successfully
- "Application is running on: http://localhost:8080" message

## Step 8: Update Deployment

When you need to update the API:

```bash
# Rebuild and push new image
gcloud builds submit --tag gcr.io/PROJECT_ID/surf-api:latest

# Redeploy (uses new image automatically)
gcloud run deploy surf-api \
  --image gcr.io/PROJECT_ID/surf-api:latest \
  --platform managed \
  --region us-central1
```

## Environment Variables Reference

| Variable | Description | Example | Notes |
|----------|-------------|---------|-------|
| `NODE_ENV` | Environment mode | `production` | Required |
| `PORT` | Server port | `8080` | **Automatically set by Cloud Run - do not set manually** |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` | Store in Secret Manager |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Random secure string | Store in Secret Manager |
| `JWT_EXPIRES_IN` | Token expiration | `1d`, `7d`, etc. | Optional, defaults to "1d" |

## Security Best Practices

1. **Use Secret Manager** for sensitive values (MONGODB_URI, JWT_SECRET)
2. **Enable CORS** only for your app domain in production
3. **Use HTTPS only** (Cloud Run provides this automatically)
4. **Set up monitoring** with Cloud Monitoring
5. **Enable logging** with Cloud Logging
6. **Set up alerts** for errors and high latency

## Monitoring and Logs

### View Logs

```bash
gcloud run services logs read surf-api --region us-central1
```

### View in Console

- Logs: https://console.cloud.google.com/run
- Metrics: https://console.cloud.google.com/monitoring

## Troubleshooting

### Common Issues

1. **Permission denied (storage.objects.get)**:
   - **Enable billing** for your project (required for Cloud Build): https://console.cloud.google.com/billing
   - Grant Storage Admin role to Cloud Build service account (see Step 1.4)
   - Verify all APIs are enabled: `gcloud services list --enabled`

2. **Port mismatch**: Ensure `PORT=8080` is set (Cloud Run default)

3. **CORS errors**: Update CORS configuration in `main.ts` to allow your app domain

4. **MongoDB connection**: Verify connection string and IP whitelist

5. **Memory issues**: Increase memory allocation with `--memory 1Gi`

### Check Service Logs

```bash
gcloud run services logs read surf-api --region us-central1 --limit 50
```

## Cost Estimation

- **Cloud Run**: 
  - Free tier: 2M requests/month, 360K GB-seconds/month
  - After free tier: ~$0.40 per million requests, $0.0000025 per GB-second
- **Container Registry**: Free for first 0.5GB storage
- **Network**: Egress charges apply (varies by region)

For typical usage: **$0-20/month** (within free tier limits)

## Next Steps

1. Update app configuration to use production API URL
2. Set up monitoring and alerts
3. Configure custom domain (if needed)
4. Set up CI/CD pipeline (optional)
