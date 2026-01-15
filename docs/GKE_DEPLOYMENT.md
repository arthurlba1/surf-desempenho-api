# GKE Deployment Architecture

## Overview

This document outlines the deployment architecture for the Surf API on Google Kubernetes Engine (GKE), designed for:
- **Scalability**: Horizontal pod autoscaling based on load
- **Security**: Secrets management, network policies, IAM least-privilege
- **Observability**: Structured logging, tracing, metrics, and alerts
- **CI/CD**: Automated deployments with rollback capabilities

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                          Google Cloud Platform                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Cloud Load Balancer (HTTPS)                                   │ │
│  │ - SSL termination                                             │ │
│  │ - Health checks                                               │ │
│  └──────────────────┬───────────────────────────────────────────┘ │
│                     │                                               │
│  ┌─────────────────▼────────────────────────────────────────────┐ │
│  │                   GKE Cluster                                 │ │
│  │                                                                │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │ Ingress Controller (nginx-ingress)                       │ │ │
│  │  │ - TLS cert management                                    │ │ │
│  │  │ - Request routing                                        │ │ │
│  │  └────────────────┬─────────────────────────────────────────┘ │ │
│  │                   │                                            │ │
│  │  ┌────────────────▼──────────────────────────────────────┐   │ │
│  │  │ surf-api Deployment (3+ replicas)                      │   │ │
│  │  │ - HorizontalPodAutoscaler                              │   │ │
│  │  │ - Resource limits/requests                             │   │ │
│  │  │ - Liveness/readiness probes                            │   │ │
│  │  │                                                         │   │ │
│  │  │  ┌─────────────────────────────────────────────────┐  │   │ │
│  │  │  │ Pod: surf-api                                   │  │   │ │
│  │  │  │ - Node.js + NestJS                              │  │   │ │
│  │  │  │ - Secrets from Secret Manager                   │  │   │ │
│  │  │  │ - Structured logging → Cloud Logging            │  │   │ │
│  │  │  │ - OpenTelemetry traces → Cloud Trace            │  │   │ │
│  │  │  └─────────────────────────────────────────────────┘  │   │ │
│  │  └───────────────────────────────────────────────────────┘   │ │
│  │                                                                │ │
│  │  ┌────────────────────────────────────────────────────────┐  │ │
│  │  │ ConfigMaps & Secrets                                   │  │ │
│  │  │ - Non-sensitive config                                 │  │ │
│  │  │ - Service accounts                                     │  │ │
│  │  └────────────────────────────────────────────────────────┘  │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                     │                                               │
│  ┌──────────────────▼───────────────────────────────────────────┐ │
│  │ MongoDB Atlas (GCP Region)                                    │ │
│  │ - Managed cluster                                             │ │
│  │ - Private VPC peering                                         │ │
│  │ - Automated backups                                           │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Secret Manager                                                │ │
│  │ - MongoDB URI                                                 │ │
│  │ - JWT secrets                                                 │ │
│  │ - API keys                                                    │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Artifact Registry                                             │ │
│  │ - Docker images                                               │ │
│  │ - Vulnerability scanning                                      │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Cloud Logging & Monitoring                                    │ │
│  │ - Application logs                                            │ │
│  │ - Metrics & alerts                                            │ │
│  │ - Uptime checks                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. GKE Cluster

**Cluster Configuration:**
- **Type**: Regional (for high availability)
- **Version**: Latest stable GKE version
- **Node pools**:
  - `default-pool`: n1-standard-2, 1-5 nodes (autoscaling)
  - Labels: `workload=api`
- **Network**: VPC-native (alias IPs)
- **Workload Identity**: Enabled (for accessing GCP services)
- **Binary Authorization**: Recommended for production

**Node Pool Sizing:**
- Dev: 1-2 nodes (n1-standard-1)
- Staging: 1-3 nodes (n1-standard-2)
- Production: 3-10 nodes (n1-standard-2 or n1-standard-4)

### 2. Kubernetes Resources

#### Deployment: surf-api

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: surf-api
  namespace: surf
spec:
  replicas: 3
  selector:
    matchLabels:
      app: surf-api
  template:
    metadata:
      labels:
        app: surf-api
    spec:
      serviceAccountName: surf-api-sa
      containers:
      - name: api
        image: us-central1-docker.pkg.dev/PROJECT_ID/surf/api:TAG
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        envFrom:
        - secretRef:
            name: surf-api-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health/ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
```

#### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: surf-api-service
  namespace: surf
spec:
  selector:
    app: surf-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

#### HorizontalPodAutoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: surf-api-hpa
  namespace: surf
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: surf-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: surf-api-ingress
  namespace: surf
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - api.surf.example.com
    secretName: surf-api-tls
  rules:
  - host: api.surf.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: surf-api-service
            port:
              number: 80
```

### 3. Secrets Management

**Strategy**: Use **Google Secret Manager** (not Kubernetes Secrets in clear text).

**Workload Identity Setup:**
1. Create GCP service account: `surf-api@PROJECT_ID.iam.gserviceaccount.com`
2. Grant permissions:
   - `roles/secretmanager.secretAccessor`
3. Bind to Kubernetes SA via Workload Identity

**Secrets to Store:**
- `MONGODB_URI`: Connection string for MongoDB Atlas
- `JWT_SECRET`: JWT signing key
- `JWT_EXPIRES_IN`: Token expiration (e.g., "1d")

**Access Pattern:**
- Option A: Use **Secrets Store CSI Driver** to mount secrets as files
- Option B: Fetch via Secret Manager API in app startup

### 4. MongoDB

**Recommendation**: **MongoDB Atlas** (managed)

**Why Atlas?**
- Managed backups & point-in-time recovery
- Automated scaling
- Built-in monitoring
- Security best practices (encryption at rest/in-transit)

**Setup:**
- Deploy in same GCP region as GKE
- Use VPC Peering for private connectivity
- Whitelist GKE node IPs (or use private endpoint)
- Connection string stored in Secret Manager

**Alternative**: Self-hosted MongoDB on GCE (more operational overhead)

### 5. Container Registry

**Service**: **Artifact Registry**

**Repository:**
- Format: Docker
- Location: `us-central1` (or your region)
- Name: `surf`
- Images: `surf/api:v1.0.0`, `surf/api:latest`

**IAM:**
- CI/CD service account: `roles/artifactregistry.writer`
- GKE nodes: `roles/artifactregistry.reader`

### 6. Ingress & TLS

**Ingress Controller**: **nginx-ingress**

**TLS Management**: **cert-manager**
- Automates Let's Encrypt certificates
- ClusterIssuer: `letsencrypt-prod`
- Automatic renewal

**Setup:**
```bash
helm install nginx-ingress ingress-nginx/ingress-nginx
helm install cert-manager jetstack/cert-manager --set installCRDs=true
```

### 7. Observability

#### Logging

**Strategy**: Structured JSON logs → Cloud Logging

**Best Practices:**
- Use Winston or Pino with JSON formatter
- Include trace IDs for correlation
- Log levels: ERROR, WARN, INFO, DEBUG
- Avoid logging sensitive data (passwords, tokens)

**Example log format:**
```json
{
  "timestamp": "2025-01-01T10:00:00Z",
  "level": "INFO",
  "service": "surf-api",
  "trace": "abc123",
  "message": "User logged in",
  "userId": "user-123",
  "schoolId": "school-456"
}
```

#### Tracing

**Strategy**: OpenTelemetry → Cloud Trace

**Instrumentation:**
- Auto-instrument with `@opentelemetry/auto-instrumentations-node`
- Trace HTTP requests, DB queries, external calls
- Propagate trace context across services

#### Metrics

**Strategy**: Prometheus metrics → Cloud Monitoring

**Key Metrics:**
- HTTP request rate, latency, status codes
- DB connection pool stats
- Queue depth (for sync commands)
- Memory/CPU usage

**Alerts:**
- Error rate > 1%
- P99 latency > 2s
- Pod restart count > 3 in 10min
- Certificate expiring in < 7 days

### 8. CI/CD Pipeline

**Tool**: **GitHub Actions** (or Cloud Build)

**Workflow:**

1. **Build**
   - Checkout code
   - Run tests (`npm test`)
   - Run linter (`npm run lint`)
   - Build Docker image
   - Tag with commit SHA and semver

2. **Push**
   - Authenticate to Artifact Registry
   - Push image

3. **Deploy**
   - Update Kubernetes manifests with new image tag
   - Apply manifests (`kubectl apply -f`)
   - Wait for rollout (`kubectl rollout status`)

**Example GitHub Actions:**

```yaml
name: Deploy to GKE

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Cloud SDK
      uses: google-github-actions/setup-gcloud@v1
      with:
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        project_id: ${{ secrets.GCP_PROJECT_ID }}
    
    - name: Configure Docker
      run: |
        gcloud auth configure-docker us-central1-docker.pkg.dev
    
    - name: Build and Push
      run: |
        cd surf-api
        docker build -t us-central1-docker.pkg.dev/$PROJECT_ID/surf/api:$GITHUB_SHA .
        docker push us-central1-docker.pkg.dev/$PROJECT_ID/surf/api:$GITHUB_SHA
    
    - name: Deploy to GKE
      run: |
        gcloud container clusters get-credentials surf-cluster --region=us-central1
        kubectl set image deployment/surf-api api=us-central1-docker.pkg.dev/$PROJECT_ID/surf/api:$GITHUB_SHA -n surf
        kubectl rollout status deployment/surf-api -n surf
```

### 9. Rollback Strategy

**Kubernetes Native:**
```bash
kubectl rollout undo deployment/surf-api -n surf
```

**Canary Deployment** (future):
- Use Flagger or Argo Rollouts
- Gradually shift traffic to new version
- Auto-rollback on error rate spike

### 10. Disaster Recovery

**Backup:**
- MongoDB: Atlas automated backups (daily + point-in-time)
- Kubernetes manifests: Version-controlled in Git
- Secrets: Backed up in Secret Manager (version history)

**RTO/RPO:**
- **RTO (Recovery Time Objective)**: < 30 minutes
- **RPO (Recovery Point Objective)**: < 1 hour (MongoDB backups)

**DR Plan:**
1. Provision new GKE cluster in different region
2. Restore MongoDB from Atlas backup
3. Deploy application from Git
4. Update DNS to point to new cluster

## Security Checklist

- [x] Workload Identity enabled (no service account keys in pods)
- [x] Secrets in Secret Manager (not in Git or Kubernetes Secrets)
- [x] Network policies to restrict pod-to-pod traffic
- [x] TLS everywhere (HTTPS, MongoDB over TLS)
- [x] Container vulnerability scanning (Artifact Registry)
- [x] Least-privilege IAM roles
- [x] Regular security updates (cluster + dependencies)

## Cost Optimization

- Use **preemptible nodes** for non-production (up to 80% cheaper)
- Enable **cluster autoscaler** to scale down during low traffic
- Set resource **requests/limits** to avoid over-provisioning
- Use **Committed Use Discounts** for production workloads

## Next Steps (Terraform Implementation)

See [TERRAFORM_GUIDE.md](./TERRAFORM_GUIDE.md) for baby-step Terraform modules to provision this infrastructure.
