# AI Models Configuration - Fatima Zehra Boutique

**Version**: 1.0
**Date**: 2026-01-26
**Status**: Multiple Models Supported

---

## Supported AI Models

The chat service supports multiple AI models through pluggable configuration.

### 1. OpenAI (Default)

**Model**: GPT-4o

**Setup**:
```bash
# Get API key from https://platform.openai.com/api-keys
# Add to .env
OPENAI_API_KEY=sk-your-api-key-here
AI_MODEL=openai
```

**Configuration** (`config/config.yaml`):
```yaml
ai:
  model: openai
  api_key: ${OPENAI_API_KEY}
  model_name: gpt-4o
  temperature: 0.7
  max_tokens: 1000
```

**Environment Variables** (`.env`):
```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
OPENAI_TEMPERATURE=0.7
```

**System Prompt**:
```
You are a helpful assistant for Fatima Zehra Boutique,
an elegant fashion e-commerce store. Help customers find
the perfect fashion items with product recommendations.
```

**Example Usage**:
```python
from app.backend.chat_service.app.ai_client import OpenAIClient

client = OpenAIClient(api_key="sk-...")
response = client.generate_response("Show me evening dresses")
# Returns: "We have beautiful evening gowns..."
```

**Pricing**: $0.015 per 1K input tokens, $0.06 per 1K output tokens

**Docs**: https://platform.openai.com/docs/api-reference/chat/create

---

### 2. Google Gemini

**Model**: Gemini Pro

**Setup**:
```bash
# Get API key from https://makersuite.google.com/app/apikey
# Add to .env
GOOGLE_API_KEY=AIzaSy...
AI_MODEL=gemini
```

**Configuration** (`config/config.yaml`):
```yaml
ai:
  model: gemini
  api_key: ${GOOGLE_API_KEY}
  model_name: gemini-pro
  temperature: 0.7
  max_tokens: 1000
```

**Environment Variables** (`.env`):
```bash
GOOGLE_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-pro
```

**Switch to Gemini**:
```bash
# 1. Update .env
GOOGLE_API_KEY=AIzaSy...
AI_MODEL=gemini

# 2. Restart service
docker-compose restart chat-service

# Or manually
cd app/backend/chat-service
python -m uvicorn app.main:app --port 8004 --reload
```

**Example Usage**:
```python
from app.backend.chat_service.app.ai_client import GeminiClient

client = GeminiClient(api_key="AIzaSy...")
response = client.generate_response("Show me evening dresses")
```

**Pricing**: Free (limited quota), Premium versions available

**Docs**: https://ai.google.dev/docs

---

### 3. Goose

**Model**: Custom/Goose Integration

**Setup**:
```bash
# Get credentials
GOOSE_API_KEY=your-goose-key
AI_MODEL=goose
```

**Configuration** (`config/config.yaml`):
```yaml
ai:
  model: goose
  api_key: ${GOOSE_API_KEY}
  endpoint: https://api.goose.ai/openai/deployments/...
```

**Switch to Goose**:
```bash
# 1. Update .env
GOOSE_API_KEY=your-key
AI_MODEL=goose

# 2. Restart
docker-compose restart chat-service
```

**Docs**: Contact Goose support

---

### 4. Custom Model

**Create custom integration**:

```python
# app/backend/chat-service/app/ai_integrations/custom_model.py

from abc import ABC, abstractmethod

class CustomAIClient(ABC):
    def __init__(self, api_key: str):
        self.api_key = api_key

    @abstractmethod
    async def generate_response(self, message: str, session_id: str) -> str:
        """Generate response from your custom model"""
        pass

    @abstractmethod
    async def stream_response(self, message: str, session_id: str):
        """Stream response (for SSE)"""
        pass

# Implement your custom model
class MyCustomModel(CustomAIClient):
    async def generate_response(self, message: str, session_id: str) -> str:
        # Your implementation
        return "Response from custom model"

    async def stream_response(self, message: str, session_id: str):
        # Your streaming implementation
        yield "Chunk 1..."
        yield "Chunk 2..."
```

**Configure**:
```yaml
ai:
  model: custom
  custom_module: app.ai_integrations.custom_model
  custom_class: MyCustomModel
  api_key: ${CUSTOM_API_KEY}
```

---

## Switching Models

### Method 1: Environment Variables

```bash
# Update .env
AI_MODEL=gemini
GOOGLE_API_KEY=AIzaSy...

# Restart service
docker-compose restart chat-service
```

### Method 2: Config File

```yaml
# config/config.yaml
ai:
  model: gemini
  api_key: ${GOOGLE_API_KEY}
```

### Method 3: Runtime Switch (Programmatically)

```python
# app/backend/chat-service/app/main.py
from app.ai_client_factory import AIClientFactory

# Create client based on config
ai_client = AIClientFactory.create_client(
    model="gemini",
    api_key="AIzaSy..."
)

response = await ai_client.generate_response(message)
```

---

## Model Comparison

| Feature | OpenAI | Gemini | Goose | Custom |
|---------|--------|--------|-------|--------|
| **Cost** | Paid | Free/Paid | Paid | Varies |
| **Performance** | Excellent | Very Good | Good | Custom |
| **Streaming** | ✅ | ✅ | ✅ | Custom |
| **Context** | 128K tokens | 30K tokens | 4K tokens | Varies |
| **Quality** | Top-tier | Excellent | Good | Depends |
| **Setup Ease** | Medium | Easy | Medium | Hard |

---

## API Key Management

### Secure Storage

```bash
# NEVER commit API keys to git
# Use environment variables only

# Store in .env (not committed)
# Or use environment variable
export OPENAI_API_KEY=sk-...

# Or use secrets manager
# - AWS Secrets Manager
# - Google Secret Manager
# - HashiCorp Vault
```

### Rotation

```bash
# 1. Generate new API key in provider dashboard
# 2. Update environment variable
# 3. Test with new key
# 4. Delete old key
# 5. Restart services
```

### Monitoring

```bash
# Monitor API usage
# - OpenAI Dashboard: https://platform.openai.com/account/billing/overview
# - Google Cloud Console: https://console.cloud.google.com
# - Set up billing alerts

# Monitor in app
# - Log API calls
# - Track tokens used
# - Set rate limits
```

---

## System Prompts

### Default System Prompt
```
You are a helpful assistant for Fatima Zehra Boutique,
an elegant fashion e-commerce store.

You help customers:
- Find products (dresses, tops, skirts, accessories, sarees, formal wear)
- Answer questions about products and store
- Recommend items based on preferences
- Provide styling advice

Be friendly, helpful, and professional.
```

### Customize System Prompt

```python
# app/backend/chat-service/app/ai_client.py

SYSTEM_PROMPT = """
You are a helpful fashion consultant for Fatima Zehra Boutique.

Available categories:
- Dresses (Evening, Casual, Party)
- Tops & Blouses
- Skirts
- Accessories (Jewelry, Scarves, Bags)
- Sarees (Banarasi, Cotton, Designer)
- Formals (Business Suits, Gowns, Dresses)

Help customers find perfect outfits and provide recommendations.
Always mention price range and availability.
"""

async def generate_response(message: str):
    response = await openai.ChatCompletion.acreate(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message}
        ]
    )
    return response.choices[0].message.content
```

---

## Advanced Features

### Function Calling (Tool Use)

```python
# Let AI call functions to search products

tools = [
    {
        "type": "function",
        "function": {
            "name": "search_products",
            "description": "Search for fashion products",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {"type": "string"},
                    "search": {"type": "string"},
                    "max_price": {"type": "number"}
                }
            }
        }
    }
]

response = await openai.ChatCompletion.acreate(
    model="gpt-4o",
    messages=[...],
    tools=tools
)
```

### Temperature & Creativity

```yaml
# config.yaml
ai:
  temperature: 0.7  # 0=deterministic, 1=creative
  top_p: 0.9        # Nucleus sampling
  max_tokens: 500   # Response length
```

### Rate Limiting

```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/chat/messages")
@limiter.limit("10/minute")  # 10 requests per minute
async def chat_endpoint(message: ChatMessage):
    # Handle chat
    return response
```

---

## Troubleshooting

### API Key Invalid
```bash
# Check key format
echo $OPENAI_API_KEY

# Test connection
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Verify in config
cat config/config.yaml | grep OPENAI_API_KEY
```

### Model Not Responding
```bash
# Check service logs
docker-compose logs chat-service

# Verify API endpoint
curl https://api.openai.com/v1/models

# Check API status
# OpenAI: https://status.openai.com
# Google: https://status.cloud.google.com
```

### High Latency
```bash
# Reduce context length
max_tokens: 500  # was 1000

# Use faster model
model: gpt-3.5-turbo  # faster than gpt-4

# Add caching
# Store frequent responses
# Reuse for similar queries
```

---

## Cost Optimization

### Token Counting
```python
import tiktoken

encoding = tiktoken.get_encoding("cl100k_base")
tokens = len(encoding.encode(message))
cost = tokens * 0.000015  # OpenAI pricing
```

### Caching
```python
# Cache responses for common queries
cache = {}

def get_response(message):
    if message in cache:
        return cache[message]

    response = call_ai_model(message)
    cache[message] = response
    return response
```

### Batching
```python
# Process multiple requests at once
responses = await openai.ChatCompletion.acreate_batch(
    requests=[
        {"messages": [...], "model": "gpt-4o"},
        {"messages": [...], "model": "gpt-4o"},
    ]
)
```

---

**AI Models Configuration Version**: 1.0
**Last Updated**: 2026-01-26
**Maintained By**: Fatima Zehra Boutique Team

