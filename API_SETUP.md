# Room AI API - Backend Setup Guide

## 🚀 Overview

This is a backend API for a Room AI app that uses the Replicate API (ControlNet model) to generate AI-redesigned room images. Users can upload a room photo, choose a style and room type, and receive an AI-generated redesign.

## 📋 API Specification

### Endpoint: `/generate`
- **Method**: `POST`
- **Content-Type**: `application/json`

### Request Format:
```json
{
  "imageUrl": "https://example.com/my-room.jpg",
  "room": "bedroom",
  "theme": "boho"
}
```

### Response Format:
```json
{
  "output": "https://replicate.delivery/generated-image-url.jpg"
}
```

### Supported Room Types:
- `bedroom`
- `kitchen`
- `living room`
- `bathroom`
- `dining room`
- `gaming room`

### Supported Themes:
- `modern`
- `vintage`
- `boho`
- `minimalist`
- `professional`
- `tropical`
- `industrial`
- `neoclassic`

## 🛠️ Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with:

```env
REPLICATE_API_KEY=your_replicate_api_key_here
NEXT_PUBLIC_UPLOAD_API_KEY=your_upload_api_key_here

# Optional (for rate limiting)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### 2. Get Your Replicate API Key

1. Go to [Replicate.com](https://replicate.com)
2. Sign up/Login
3. Go to Account Settings → API Tokens
4. Create a new token
5. Copy the token to your `.env.local` file

### 3. Local Development

```bash
npm install
npm run dev
```

The API will be available at: `http://localhost:3000/generate`

### 4. Deploy to Vercel

#### Option A: Vercel CLI
```bash
npm install -g vercel
vercel
```

#### Option B: GitHub Integration
1. Push your code to GitHub
2. Go to [Vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard:
   - `REPLICATE_API_KEY`
   - Other optional variables

#### Option C: Direct Deploy
1. Go to [Vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from Git or upload folder
4. Configure environment variables
5. Deploy

## 🧪 Testing the API

### Using curl:
```bash
curl -X POST https://your-vercel-app.vercel.app/generate \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/room.jpg",
    "room": "bedroom",
    "theme": "modern"
  }'
```

### Using JavaScript:
```javascript
const response = await fetch('https://your-vercel-app.vercel.app/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    imageUrl: 'https://example.com/room.jpg',
    room: 'bedroom',
    theme: 'modern'
  })
});

const result = await response.json();
console.log(result.output); // Generated image URL
```

## 🌐 CORS Configuration

The API is configured to accept requests from any origin (`*`) to support Flutter and other frontend applications. CORS headers are automatically added to all responses.

## ⚡ Features

- ✅ **Replicate ControlNet Integration**: Uses advanced AI models for room redesign
- ✅ **Rate Limiting**: 5 requests per 24 hours (configurable)
- ✅ **CORS Enabled**: Works with Flutter and web frontends
- ✅ **Error Handling**: Comprehensive error responses
- ✅ **Input Validation**: Validates required fields
- ✅ **Async Processing**: Polls Replicate until image is ready
- ✅ **Vercel Optimized**: 5-minute timeout for long-running requests

## 🔧 Customization

### Modify Room Prompts
Edit the prompt generation logic in `app/generate/route.ts`:

```typescript
prompt: room === "Gaming Room"
  ? "a room for gaming with gaming computers, gaming consoles, and gaming chairs"
  : `a ${theme.toLowerCase()} ${room.toLowerCase()}`,
```

### Adjust Rate Limiting
Modify the rate limiter configuration:

```typescript
limiter: Ratelimit.fixedWindow(5, "1440 m"), // 5 requests per 24 hours
```

### Change AI Model
Update the Replicate model version:

```typescript
version: "854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b"
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Missing required fields" error**
   - Ensure all three fields are provided: `imageUrl`, `room`, `theme`

2. **"Failed to start image generation" error**
   - Check your `REPLICATE_API_KEY` is valid
   - Verify the image URL is accessible

3. **CORS errors**
   - The API includes CORS headers, but ensure your frontend is making the request correctly

4. **Rate limiting**
   - Default limit is 5 requests per 24 hours. Configure Redis for production use.

## 📝 API Response Examples

### Success Response:
```json
{
  "output": "https://replicate.delivery/pbxt/abc123.jpg"
}
```

### Error Responses:
```json
{
  "error": "Missing required fields: imageUrl, theme, and room are required"
}
```

```json
{
  "error": "Too many uploads in 1 day. Please try again in a 24 hours."
}
```

## 📚 Next Steps

1. Set up your Replicate API key
2. Deploy to Vercel
3. Test the API endpoint
4. Integrate with your Flutter frontend
5. Configure rate limiting for production use

Your API will be ready to receive room images and return AI-generated redesigns! 🎨 