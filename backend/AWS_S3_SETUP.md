# AWS S3 Setup Guide - Hidden Gem

## Overview

The Hidden Gem backend supports automatic image uploads to AWS S3 with CloudFront CDN integration. If S3 credentials are not configured, it automatically falls back to local file storage.

## Image Processing Pipeline

1. **Upload** - User uploads image via mobile app
2. **Optimization** - Sharp library:
   - Resizes to max dimensions (1200x1200 for places, 400x400 for avatars)
   - Converts to WebP format (smaller file size)
   - Applies compression (quality 70-85%)
3. **Upload to S3** - Optimized image uploaded to S3 bucket
4. **Serve via CloudFront** - Images served through CloudFront CDN for faster delivery

## File Structure in S3

```
s3://hidden-gem-media/
├── place-images/
│   ├── 2025/01/
│   └── 2025/02/
├── avatars/
│   ├── 2025/01/
│   └── 2025/02/
└── thumbnails/
    ├── 2025/01/
    └── 2025/02/
```

## Setup Instructions

### 1. Create AWS S3 Bucket

```bash
# Using AWS CLI
aws s3 mb s3://hidden-gem-media --region ap-southeast-1
```

Or via AWS Console:

- Go to S3 service
- Click "Create bucket"
- Name: `hidden-gem-media`
- Region: `ap-southeast-1` (or your preferred region)
- Block all public access ✓ (we'll use CloudFront)

### 2. Configure Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudFrontAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity/XXXXXX"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::hidden-gem-media/*"
    }
  ]
}
```

### 3. Create CloudFront Distribution (Optional but Recommended)

This makes image delivery much faster globally.

```bash
# Using AWS CLI to create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name hidden-gem-media.s3.ap-southeast-1.amazonaws.com \
  --default-root-object index.html
```

Or via AWS Console:

1. Go to CloudFront service
2. Click "Create distribution"
3. Set origin domain to: `hidden-gem-media.s3.ap-southeast-1.amazonaws.com`
4. Restrict viewer access to S3 (use OAI - Origin Access Identity)
5. Get the CloudFront domain (e.g., `d123abc.cloudfront.net`)

### 4. Update `.env` File

```env
# Enable S3 (replace with real credentials)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=hidden-gem-media
AWS_REGION=ap-southeast-1

# Optional: CloudFront domain for faster delivery
AWS_CLOUDFRONT_DOMAIN=d123abc.cloudfront.net
```

### 5. Create IAM User for Application

For security, create an IAM user with limited S3 permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::hidden-gem-media/*"
    }
  ]
}
```

## Installation

Dependencies already installed in `package.json`:

- `@aws-sdk/client-s3` - AWS SDK for S3
- `sharp` - Image optimization library

If not installed, run:

```bash
npm install @aws-sdk/client-s3 sharp
```

## Testing

### 1. Test Local Storage (default)

```bash
npm run start:dev
# Upload an image through the mobile app
# Check `./uploads` folder for optimized images
```

### 2. Test S3 Upload

```bash
# Update .env with real AWS credentials
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

npm run start:dev
# Upload an image through the mobile app
# Check S3 bucket in AWS Console
# Verify image is WebP format and optimized size
```

## Fallback Behavior

The system automatically detects if S3 credentials are valid:

- ✅ Valid S3 creds → Upload to S3 + CloudFront
- ❌ Invalid/placeholder creds → Use local storage (`./uploads/`)
- ❌ No creds → Use local storage

This allows development without AWS setup!

## Image Optimization Results

**Before:**

- Original JPG: 3.2 MB
- Dimensions: 4000x3000px

**After (WebP):**

- Optimized: 280 KB (91% reduction!)
- Dimensions: 1200x1200px (resized)
- Quality: 80/100

## Mobile App Integration

The mobile app automatically sends `multipart/form-data` with:

- Field: `images` (multiple files)
- Max files: 10
- Max file size: 10 MB each

API endpoint: `POST /places` with form data

## Production Checklist

- [ ] Create separate S3 bucket for production
- [ ] Create IAM user with minimal permissions
- [ ] Enable versioning on S3 bucket
- [ ] Configure lifecycle policy (delete old versions after 30 days)
- [ ] Setup CloudFront distribution for CDN
- [ ] Enable S3 access logging
- [ ] Setup CloudWatch alarms for S3 errors
- [ ] Test image uploads and delivery
- [ ] Monitor S3 costs

## Troubleshooting

### Images not uploading

1. Check AWS credentials in `.env`
2. Verify S3 bucket name is correct
3. Check IAM user has `s3:PutObject` permission
4. Look at backend logs for error messages

### Images appear broken in app

1. Verify CloudFront distribution is active
2. Check CloudFront cache is not stale (clear if needed)
3. Verify S3 bucket policy allows CloudFront access
4. Test direct S3 URL in browser

### Upload too slow

1. S3 region may be far from users - consider using closer region
2. Enable CloudFront caching (already configured)
3. Optimize image size before upload (mobile app handles this)

## Costs Estimation

**Assuming 100,000 monthly active users, 5 images per user:**

- S3 Storage: ~500 GB = $11.50/month
- S3 Requests: 50M/month = ~$2.50/month
- CloudFront: ~1 TB bandwidth = $85/month
- **Total: ~$99/month**

Consider using AWS free tier for testing!
