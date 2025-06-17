# 🚀 Room AI API - Quick Deployment Guide

## ✅ Pre-Deployment Checklist

- [ ] Get Replicate API key from [replicate.com](https://replicate.com)
- [ ] Ensure code is pushed to GitHub repository
- [ ] Review API endpoint configuration
- [ ] Test API locally (optional)

## 🌐 Deploy to Vercel

### Method 1: GitHub Integration (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   ```
   REPLICATE_API_KEY=your_actual_replicate_api_key
   ```
5. Click "Deploy"

### Method 2: Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

## 🔧 Environment Variables to Set in Vercel

| Variable | Required | Description |
|----------|----------|-------------|
| `REPLICATE_API_KEY` | ✅ Yes | Your Replicate API token |
| `UPSTASH_REDIS_REST_URL` | ❌ Optional | For rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | ❌ Optional | For rate limiting |

## 📋 API Endpoint Summary

**Endpoint:** `https://your-app.vercel.app/generate`

**Request:**
```json
{
  "imageUrl": "https://example.com/room.jpg",
  "room": "Bedroom",
  "theme": "Modern"
}
```

**Response:**
```json
{
  "output": "https://replicate.delivery/generated-image.jpg"
}
```

## 🧪 Testing Your Deployed API

```bash
curl -X POST https://your-app.vercel.app/generate \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
    "room": "Bedroom",
    "theme": "Modern"
  }'
```

## 📱 Flutter Integration Example

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<String> generateRoom(String imageUrl, String room, String theme) async {
  final response = await http.post(
    Uri.parse('https://your-app.vercel.app/generate'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'imageUrl': imageUrl,
      'room': room,
      'theme': theme,
    }),
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return data['output'];
  } else {
    throw Exception('Failed to generate room');
  }
}
```

## 🎨 Supported Values

### Room Types:
- Living Room
- Dining Room  
- Bedroom
- Bathroom
- Office
- Gaming Room

### Themes:
- Modern
- Minimalist
- Professional
- Tropical
- Vintage

## 🚨 Common Issues

1. **502 Bad Gateway**: Check environment variables are set
2. **CORS Errors**: API has CORS enabled, check your request format
3. **Rate Limiting**: Default 5 requests per 24 hours
4. **Image Generation Failed**: Verify image URL is accessible

## 📈 Next Steps After Deployment

1. ✅ Test the API endpoint
2. ✅ Integrate with Flutter frontend
3. ✅ Set up monitoring/logging
4. ✅ Configure custom domain (optional)
5. ✅ Set up rate limiting with Redis for production

Your Room AI API is ready to transform room images! 🏠✨ 