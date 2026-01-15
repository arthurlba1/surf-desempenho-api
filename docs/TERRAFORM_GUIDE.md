# Terraform Guide - Baby Steps for GCP Infrastructure

## Overview

This guide walks through setting up GCP infrastructure for the Surf API using Terraform, **one baby step at a time**. Each step is small, reviewable, and builds on the previous one.

### Pick the Right Compute for MVP (50 users)

For the first months (ex: ~50 users), **GKE is usually overkill**. A much cheaper + simpler option is **Cloud Run**:

- **Cloud Run (recommended for MVP)**: serverless containers, scales to zero, minimal ops.
- **GKE**: great when you need k8s primitives, multi-service mesh, heavy workloads, or higher traffic.

This guide keeps the **GKE path** (learning-focused), but the **Cost** section below includes a Cloud Run + MongoDB Atlas M0/M2 path that is dramatically cheaper.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Terraform** installed (v1.5+): `brew install terraform` or download from https://terraform.io
3. **gcloud CLI** installed: `brew install google-cloud-sdk` or https://cloud.google.com/sdk/docs/install
4. **Authenticated**: `gcloud auth application-default login`

## Project Structure

```
infra/terraform/
├── modules/
│   ├── foundation/
│   ├── network/
│   ├── gke/
│   ├── artifact-registry/
│   └── observability/
└── envs/
    ├── dev/
    ├── staging/
    └── prod/
```

---

## Step 1: Bootstrap - Remote State (10 minutes)

### What & Why
Create a GCS bucket to store Terraform state remotely. This enables:
- Team collaboration
- State locking (prevents concurrent modifications)
- Version history

### Commands

```bash
# Set your project ID
export PROJECT_ID="your-project-id"

# Create the bucket manually (one-time setup)
gsutil mb -p $PROJECT_ID -l us-central1 gs://${PROJECT_ID}-terraform-state

# Enable versioning
gsutil versioning set on gs://${PROJECT_ID}-terraform-state
```

### Create `infra/terraform/envs/dev/backend.tf`

```hcl
terraform {
  backend "gcs" {
    bucket = "your-project-id-terraform-state"
    prefix = "surf/dev"
  }
}
```

### Initialize

```bash
cd infra/terraform/envs/dev
terraform init
```

**Expected output**: `Terraform has been successfully initialized!`

---

## Step 2: Foundation - Enable APIs & Service Accounts (15 minutes)

### What & Why
Enable required GCP APIs and create service accounts with least-privilege permissions.

### Create `infra/terraform/modules/foundation/main.tf`

```hcl
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

# Enable required APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "compute.googleapis.com",
    "container.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
    "secretmanager.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
  ])

  project = var.project_id
  service = each.value

  disable_on_destroy = false
}

# Service account for GKE workloads
resource "google_service_account" "surf_api" {
  project      = var.project_id
  account_id   = "surf-api"
  display_name = "Surf API Service Account"
}

# Grant Secret Manager access
resource "google_project_iam_member" "surf_api_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.surf_api.email}"
}

# Grant logging permissions
resource "google_project_iam_member" "surf_api_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.surf_api.email}"
}

# Service account for CI/CD
resource "google_service_account" "cicd" {
  project      = var.project_id
  account_id   = "surf-cicd"
  display_name = "Surf CI/CD Service Account"
}

# Grant Artifact Registry push permissions
resource "google_project_iam_member" "cicd_artifact_registry" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.cicd.email}"
}

# Grant GKE admin (for deployments)
resource "google_project_iam_member" "cicd_gke" {
  project = var.project_id
  role    = "roles/container.admin"
  member  = "serviceAccount:${google_service_account.cicd.email}"
}

output "surf_api_service_account_email" {
  value = google_service_account.surf_api.email
}

output "cicd_service_account_email" {
  value = google_service_account.cicd.email
}
```

### Create `infra/terraform/envs/dev/main.tf`

```hcl
terraform {
  required_version = ">= 1.5"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

module "foundation" {
  source     = "../../modules/foundation"
  project_id = var.project_id
  region     = var.region
}

output "surf_api_sa" {
  value = module.foundation.surf_api_service_account_email
}

output "cicd_sa" {
  value = module.foundation.cicd_service_account_email
}
```

### Apply

```bash
cd infra/terraform/envs/dev
terraform plan
terraform apply
```

**What to review**: Service account emails, IAM bindings

---

## Step 3: Artifact Registry (10 minutes)

### What & Why
Create a Docker repository for storing container images.

### Create `infra/terraform/modules/artifact-registry/main.tf`

```hcl
variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

resource "google_artifact_registry_repository" "surf" {
  project       = var.project_id
  location      = var.region
  repository_id = "surf"
  format        = "DOCKER"
  description   = "Docker images for Surf application"
}

output "repository_url" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.surf.repository_id}"
}
```

### Add to `infra/terraform/envs/dev/main.tf`

```hcl
module "artifact_registry" {
  source     = "../../modules/artifact-registry"
  project_id = var.project_id
  region     = var.region
}

output "artifact_registry_url" {
  value = module.artifact_registry.repository_url
}
```

### Apply

```bash
terraform plan
terraform apply
```

**Test**: Push a test image
```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
docker tag hello-world:latest us-central1-docker.pkg.dev/$PROJECT_ID/surf/test:v1
docker push us-central1-docker.pkg.dev/$PROJECT_ID/surf/test:v1
```

---

## Step 4: Network (15 minutes)

### What & Why
Create a VPC and subnets for GKE cluster isolation.

### Create `infra/terraform/modules/network/main.tf`

```hcl
variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "network_name" {
  type    = string
  default = "surf-network"
}

resource "google_compute_network" "vpc" {
  project                 = var.project_id
  name                    = var.network_name
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "gke" {
  project       = var.project_id
  name          = "${var.network_name}-gke"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.1.0.0/16"
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.2.0.0/20"
  }
}

# Firewall: allow health checks
resource "google_compute_firewall" "allow_health_checks" {
  project = var.project_id
  name    = "${var.network_name}-allow-health-checks"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
  }

  source_ranges = ["130.211.0.0/22", "35.191.0.0/16"]
}

output "network_name" {
  value = google_compute_network.vpc.name
}

output "subnet_name" {
  value = google_compute_subnetwork.gke.name
}
```

### Add to `infra/terraform/envs/dev/main.tf`

```hcl
module "network" {
  source     = "../../modules/network"
  project_id = var.project_id
  region     = var.region
}
```

### Apply

```bash
terraform plan
terraform apply
```

---

## Step 5: GKE Cluster (20 minutes)

### What & Why
Create a GKE cluster with autoscaling and Workload Identity.

### Create `infra/terraform/modules/gke/main.tf`

```hcl
variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "network_name" {
  type = string
}

variable "subnet_name" {
  type = string
}

variable "cluster_name" {
  type    = string
  default = "surf-cluster"
}

resource "google_container_cluster" "primary" {
  project  = var.project_id
  name     = var.cluster_name
  location = var.region

  # We can't create a cluster with no node pool, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = var.network_name
  subnetwork = var.subnet_name

  # Enable Workload Identity
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Enable VPC-native (alias IPs)
  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  # Enable logging and monitoring
  logging_config {
    enable_components = ["SYSTEM_COMPONENTS", "WORKLOADS"]
  }

  monitoring_config {
    enable_components = ["SYSTEM_COMPONENTS"]
    managed_prometheus {
      enabled = true
    }
  }
}

resource "google_container_node_pool" "primary_nodes" {
  project    = var.project_id
  name       = "${var.cluster_name}-node-pool"
  location   = var.region
  cluster    = google_container_cluster.primary.name
  node_count = 1

  autoscaling {
    min_node_count = 1
    max_node_count = 5
  }

  node_config {
    machine_type = "n1-standard-2"
    disk_size_gb = 50

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    labels = {
      workload = "api"
    }

    # Enable Workload Identity
    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    metadata = {
      disable-legacy-endpoints = "true"
    }
  }
}

output "cluster_name" {
  value = google_container_cluster.primary.name
}

output "cluster_endpoint" {
  value = google_container_cluster.primary.endpoint
}
```

### Add to `infra/terraform/envs/dev/main.tf`

```hcl
module "gke" {
  source       = "../../modules/gke"
  project_id   = var.project_id
  region       = var.region
  network_name = module.network.network_name
  subnet_name  = module.network.subnet_name
}

output "gke_cluster_name" {
  value = module.gke.cluster_name
}
```

### Apply

```bash
terraform plan
terraform apply  # This will take 5-10 minutes
```

**Test**: Connect to cluster
```bash
gcloud container clusters get-credentials surf-cluster --region=us-central1
kubectl get nodes
```

---

## Step 6: Observability Setup (Document only, manual setup)

For observability, we'll document the setup but won't fully automate in Terraform (baby steps):

### Cloud Logging (Auto-enabled)
GKE automatically sends logs to Cloud Logging. No Terraform needed.

### Monitoring Alerts

Create these manually in Cloud Console for now (or future Terraform module):
- **High Error Rate**: Error logs > 10/min
- **High Latency**: P99 > 2s
- **Pod Restarts**: > 3 restarts in 10min
- **Low Disk Space**: < 10% free

---

## Step 7: Secrets (Manual + Documentation)

Terraform shouldn't manage secret values directly. Document the manual process:

### Create Secrets

```bash
# MongoDB URI
echo -n "mongodb://..." | gcloud secrets create mongodb-uri --data-file=-

# JWT Secret
openssl rand -base64 32 | gcloud secrets create jwt-secret --data-file=-

# Grant access to surf-api SA
gcloud secrets add-iam-policy-binding mongodb-uri \
  --member="serviceAccount:surf-api@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:surf-api@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Summary: Baby Steps Completed

1. ✅ Remote state (GCS bucket)
2. ✅ Foundation (APIs, service accounts)
3. ✅ Artifact Registry
4. ✅ Network (VPC, subnets)
5. ✅ GKE cluster
6. ✅ Observability (documented)
7. ✅ Secrets (documented manual process)

## Next Steps

- Deploy Kubernetes manifests (see [GKE_DEPLOYMENT.md](./GKE_DEPLOYMENT.md))
- Setup CI/CD pipeline (GitHub Actions)
- Configure monitoring alerts
- Setup MongoDB Atlas (separate from Terraform)

## Tips for Learning Terraform

1. **Always `plan` before `apply`**: Review changes before applying
2. **Use `terraform fmt`**: Auto-format your `.tf` files
3. **Use `terraform validate`**: Check syntax errors
4. **Read the plan output**: Understand what will be created/changed/destroyed
5. **Small PRs**: Each baby step should be one PR
6. **Test in dev first**: Never test directly in production

## Troubleshooting

**State lock error**: Someone else is running Terraform. Wait or force-unlock (carefully).

**Quota exceeded**: Request quota increase in Cloud Console.

**API not enabled**: The foundation module should handle this, but if not:
```bash
gcloud services enable APINAME.googleapis.com
```

## Cost Estimate (Dev Environment)

- **GKE path (learning / k8s)**:
  - GKE cluster: ~$70/month (1-2 nodes n1-standard-2)
  - Artifact Registry: ~$1/month (< 10GB storage)
  - Cloud Logging: Free tier (usually sufficient for dev)
  - MongoDB Atlas: ~$57/month (M10 dedicated-tier)

- **Cloud Run path (recommended for MVP ~50 users)**:
  - Cloud Run: typically **$0–$15/month** (often near $0 for low traffic; pay-per-request)
  - MongoDB Atlas **M0**: **$0/month** (free tier, 512MB) or **M2**: ~$9/month
  - Artifact Registry: ~$1/month (optional but recommended)
  - Cloud Logging: Free tier for MVP is usually enough

**Total**:
- GKE + M10: ~$130/month
- Cloud Run + MongoDB M0: ~$0–$16/month
- Cloud Run + MongoDB M2: ~$10–$25/month
