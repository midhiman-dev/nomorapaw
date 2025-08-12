# OpenAI API Key Security Guide

This document outlines the recommended approaches for securely storing and managing your OpenAI API key in production environments.

## 🔐 Security Requirements

**CRITICAL**: Never commit API keys to version control or include them in your source code.

## 📋 Recommended Storage Methods

### 1. Environment Variables (Recommended for Development)

**Setup:**
```bash
# Create .env file in backend directory
echo "OPENAI_API_KEY=sk-your-actual-api-key-here" > .env

# Ensure .env is in .gitignore
echo ".env" >> .gitignore
```

**Usage:**
```python
import os
api_key = os.getenv("OPENAI_API_KEY")
```

### 2. Docker Secrets (Recommended for Docker Deployments)

**Setup:**
```bash
# Create secret file
echo "sk-your-actual-api-key-here" | docker secret create openai_api_key -

# Use in docker-compose.yml
services:
  backend:
    secrets:
      - openai_api_key
    environment:
      - OPENAI_API_KEY_FILE=/run/secrets/openai_api_key
```

### 3. Cloud Provider Secret Management

#### AWS Secrets Manager
```python
import boto3
from botocore.exceptions import ClientError

def get_secret():
    secret_name = "nomora-paw/openai-api-key"
    region_name = "us-west-2"
    
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )
    
    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
        return get_secret_value_response['SecretString']
    except ClientError as e:
        raise e
```

#### Google Cloud Secret Manager
```python
from google.cloud import secretmanager

def get_secret():
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/your-project-id/secrets/openai-api-key/versions/latest"
    
    response = client.access_secret_version(request={"name": name})
    return response.payload.data.decode("UTF-8")
```

#### Azure Key Vault
```python
from azure.keyvault.secrets import SecretClient
from azure.identity import DefaultAzureCredential

def get_secret():
    credential = DefaultAzureCredential()
    client = SecretClient(
        vault_url="https://your-vault-name.vault.azure.net/",
        credential=credential
    )
    
    secret = client.get_secret("openai-api-key")
    return secret.value
```

### 4. Kubernetes Secrets (For Kubernetes Deployments)

**Create secret:**
```bash
kubectl create secret generic openai-api-key \
  --from-literal=api-key=sk-your-actual-api-key-here
```

**Use in deployment:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nomora-paw-backend
spec:
  template:
    spec:
      containers:
      - name: backend
        image: nomora-paw-backend:latest
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: openai-api-key
              key: api-key
```

## 🚀 Production Deployment Examples

### Heroku
```bash
# Set environment variable
heroku config:set OPENAI_API_KEY=sk-your-actual-api-key-here -a your-app-name
```

### Railway
```bash
# Set environment variable in Railway dashboard or CLI
railway variables set OPENAI_API_KEY=sk-your-actual-api-key-here
```

### Vercel
```bash
# Set environment variable
vercel env add OPENAI_API_KEY
# Enter your API key when prompted
```

### Netlify Functions
```bash
# Set environment variable in Netlify dashboard
# Or use Netlify CLI
netlify env:set OPENAI_API_KEY sk-your-actual-api-key-here
```

## 🔍 Security Best Practices

### 1. API Key Rotation
- Regularly rotate your API keys (monthly recommended)
- Use OpenAI dashboard to generate new keys
- Update all environments simultaneously

### 2. Access Control
- Limit API key permissions to minimum required
- Use separate keys for different environments
- Monitor API key usage in OpenAI dashboard

### 3. Network Security
- Use HTTPS for all API communications
- Implement proper CORS policies
- Consider IP whitelisting for production

### 4. Monitoring and Logging
- Monitor API usage and costs
- Log API errors (but never log the API key)
- Set up alerts for unusual usage patterns

### 5. Environment Separation
```bash
# Development
OPENAI_API_KEY=sk-dev-key-here
ENVIRONMENT=development

# Staging
OPENAI_API_KEY=sk-staging-key-here
ENVIRONMENT=staging

# Production
OPENAI_API_KEY=sk-prod-key-here
ENVIRONMENT=production
```

## ⚠️ What NOT to Do

❌ **Never do these:**
- Commit API keys to Git repositories
- Include keys in Docker images
- Store keys in client-side code
- Share keys in chat/email
- Use production keys in development
- Log API keys in application logs

## 🧪 Testing Security

### Verify API Key is Not Exposed
```bash
# Check if API key appears in your codebase
grep -r "sk-" . --exclude-dir=node_modules --exclude-dir=.git

# Check Docker image doesn't contain secrets
docker history your-image-name --no-trunc

# Verify environment variables are loaded correctly
python -c "import os; print('API key loaded:', bool(os.getenv('OPENAI_API_KEY')))"
```

## 📞 Emergency Response

If your API key is compromised:

1. **Immediately revoke** the key in OpenAI dashboard
2. **Generate a new key** and update all environments
3. **Review usage logs** for unauthorized access
4. **Check billing** for unexpected charges
5. **Audit your codebase** for potential exposure points

## 📚 Additional Resources

- [OpenAI API Key Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12-Factor App Config](https://12factor.net/config)