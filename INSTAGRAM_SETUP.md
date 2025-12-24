# Instagram Feed Setup Guide

The Instagram feed component automatically displays your latest Instagram posts in the "For More Guidance" section of the home page.

## Setup Instructions

### Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Business" as the app type
4. Fill in your app details and create the app

### Step 2: Add Instagram Graph API

1. In your Facebook App dashboard, go to "Add Products"
2. Find "Instagram Graph API" and click "Set Up"
3. Follow the setup wizard

### Step 3: Get Instagram User ID

1. Go to [Instagram Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from the dropdown
3. Generate a User Token (short-lived)
4. In the API Explorer, make a GET request to: `me?fields=instagram_business_account`
5. Copy the `id` from the `instagram_business_account` object - this is your `INSTAGRAM_USER_ID`

### Step 4: Generate Long-Lived Access Token

1. In the Graph API Explorer, generate a User Token
2. Go to [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
3. Paste your short-lived token and click "Extend Access Token"
4. Copy the long-lived token - this is your `INSTAGRAM_ACCESS_TOKEN`

**Note:** Long-lived tokens expire after 60 days. For production, consider implementing token refresh logic.

### Step 5: Add Environment Variables

Add these to your `.env.local` file:

```env
INSTAGRAM_ACCESS_TOKEN=your_long_lived_access_token_here
INSTAGRAM_USER_ID=your_instagram_user_id_here
```

### Step 6: Test the Integration

1. Restart your development server
2. Navigate to the home page
3. Scroll to the "For More Guidance" section
4. You should see your latest Instagram posts in a 3x2 grid

## Features

- **Automatic Updates**: Fetches latest posts from your Instagram account
- **Responsive Grid**: Displays 6 latest posts in a 3-column grid
- **Media Support**: Supports images, videos, and carousel posts
- **Hover Effects**: Interactive hover effects with Instagram branding
- **Fallback**: Shows a placeholder if API credentials are not configured

## Troubleshooting

### Feed Not Showing

1. **Check Environment Variables**: Ensure `INSTAGRAM_ACCESS_TOKEN` and `INSTAGRAM_USER_ID` are set correctly
2. **Check Token Validity**: Verify your access token hasn't expired
3. **Check Permissions**: Ensure your token has `instagram_basic` and `pages_read_engagement` permissions
4. **Check Console**: Look for errors in the browser console or server logs

### Token Expired

Long-lived tokens expire after 60 days. You'll need to:
1. Generate a new short-lived token
2. Extend it to a long-lived token
3. Update your `.env.local` file

### Rate Limits

Instagram API has rate limits. The feed is cached for 1 hour to minimize API calls. If you hit rate limits:
- Wait before making more requests
- Consider implementing a longer cache duration
- Use a more efficient caching strategy

## Alternative: Instagram Basic Display API

If you prefer using Instagram Basic Display API instead:

1. Go to your Facebook App → Products → Instagram Basic Display
2. Configure OAuth redirect URIs
3. Use the Basic Display API endpoints instead of Graph API
4. Update the API route accordingly

## Support

For more information, visit:
- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [Facebook Developers Support](https://developers.facebook.com/support/)

