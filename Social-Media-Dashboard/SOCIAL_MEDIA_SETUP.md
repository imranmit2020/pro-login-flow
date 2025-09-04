# Social Media Pages Setup Guide

This guide explains how to connect your Facebook Page and Instagram Business Account to OfinaPulse Dashboard.

## Prerequisites

- Facebook Page (must be admin/owner)
- Instagram Business Account (connected to a Facebook Page)
- Facebook Developer Account

## Facebook Page Setup

### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/apps)
2. Click "Create App" → "Business" → "Continue"
3. Enter app name (e.g., "OfinaPulse Dashboard")
4. Add your email and select a business account
5. Click "Create App"

### Step 2: Configure App Products
1. In your app dashboard, click "Add Product"
2. Add these products:
   - **Facebook Login** - For authentication
   - **Webhooks** - For real-time updates
   - **Messenger** - For messaging capabilities

### Step 3: Get App Credentials
1. Go to Settings → Basic
2. Copy your **App ID** and **App Secret**
3. Add your domain to "App Domains"
4. Save changes

### Step 4: Get Page Access Token
1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer)
2. Select your app from dropdown
3. Get Token → Get Page Access Token
4. Select your Facebook Page
5. Add these permissions:
   - `pages_show_list`
   - `pages_messaging`
   - `pages_read_engagement`
   - `pages_manage_metadata`
6. Generate Access Token
7. **Important**: Extend to long-lived token:
   ```
   https://graph.facebook.com/oauth/access_token?
   grant_type=fb_exchange_token&
   client_id={your-app-id}&
   client_secret={your-app-secret}&
   fb_exchange_token={your-page-access-token}
   ```

### Step 5: Get Page ID
1. Go to your Facebook Page
2. Click "About" → "Page transparency" → "See more"
3. Copy the Page ID number
4. Or use Graph API Explorer: `me/accounts`

## Instagram Business Setup

### Step 1: Convert to Business Account
1. Open Instagram app
2. Go to Settings → Account → Switch to Professional Account
3. Choose "Business"
4. Connect to your Facebook Page

### Step 2: Get Instagram Business Account ID
1. Use Graph API Explorer
2. Use the same Page Access Token from Facebook setup
3. Query: `me/accounts?fields=instagram_business_account`
4. Copy the Instagram Business Account ID

### Step 3: Required Permissions
Add these permissions to your Facebook app:
- `instagram_basic`
- `instagram_manage_messages`
- `pages_messaging` (required for Instagram DMs)
- `pages_show_list`

## Environment Variables

Set these in your `.env.local` file:

```bash
# Facebook Page
FACEBOOK_PAGE_ACCESS_TOKEN=EAAxxxxxx...
FACEBOOK_PAGE_ID=123456789012345
FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=your-app-secret

# Instagram Business Account
INSTAGRAM_ACCESS_TOKEN=EAAxxxxxx...  # Same as Facebook Page token
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841475533389585
```

## Testing Your Setup

### Test Facebook Connection
```bash
curl "https://graph.facebook.com/me?access_token=YOUR_PAGE_TOKEN"
```

### Test Instagram Connection
```bash
curl "https://graph.facebook.com/YOUR_INSTAGRAM_ID?fields=username,name&access_token=YOUR_PAGE_TOKEN"
```

## Common Issues

### "Invalid Access Token"
- Make sure you're using a **Page Access Token**, not User Access Token
- Ensure the token is long-lived (60 days)
- Check that all required permissions are granted

### "Instagram Account Not Found"
- Verify Instagram is connected to your Facebook Page
- Ensure you're using Instagram Business Account (not Personal)
- Check the Instagram Business Account ID is correct

### "Permission Denied"
- You must be admin/owner of the Facebook Page
- Instagram account must be connected to the Facebook Page
- All required permissions must be approved

## Security Notes

- **Never commit access tokens to git**
- Store tokens in environment variables only
- App Secret should never be exposed publicly
- Regenerate tokens if compromised
- Use long-lived tokens for production

## Webhooks Configuration (Optional)

For real-time message updates:

1. Add webhook URL: `https://yourdomain.com/api/facebook/webhook`
2. Subscribe to these fields:
   - `messages`
   - `messaging_postbacks`
   - `messaging_optins`
3. Set verify token in webhook configuration

## Support

If you need help:
1. Check Facebook Developer Documentation
2. Verify all permissions are granted
3. Test tokens in Graph API Explorer
4. Check app is not in development mode restrictions 