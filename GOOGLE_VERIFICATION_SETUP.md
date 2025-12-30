# Google Search Console Verification Setup

## Quick Setup Guide

When you get your Google Search Console verification code, follow these steps:

### Step 1: Get Your Verification Code

1. Go to: https://search.google.com/search-console
2. Add your property (your website URL)
3. Choose verification method: **HTML tag**
4. Copy the verification code (looks like: `abc123def456ghi789`)

### Step 2: Add Verification Meta Tag

**Option A: Add to layout.tsx (Recommended)**

1. Open: `src/app/layout.tsx`
2. Find the `<head>` section (around line 125)
3. Add the verification meta tag:

```tsx
<head>
  {/* ... existing head content ... */}
  
  {/* Google Search Console Verification */}
  <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" />
  
  {/* ... rest of head content ... */}
</head>
```

**Full example:**

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ... existing code ...

  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="alternate icon" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* ... rest of head content ... */}
      </head>
      {/* ... rest of component ... */}
    </html>
  )
}
```

### Step 3: Deploy and Verify

1. **Commit and push your changes:**
   ```bash
   git add src/app/layout.tsx
   git commit -m "Add Google Search Console verification"
   git push
   ```

2. **Deploy to production** (if using Vercel/Netlify, it will auto-deploy)

3. **Verify in Google Search Console:**
   - Go back to Google Search Console
   - Click "Verify"
   - Should see "Ownership verified" ✅

### Alternative: HTML File Method

If you prefer the HTML file method:

1. Download the HTML file from Google Search Console
2. Place it in the `public/` folder
3. The file will be accessible at: `https://seemycampus.com/google[random].html`
4. Click "Verify" in Search Console

### Alternative: DNS Method (Most Reliable)

1. In Google Search Console, choose "DNS record" verification
2. Add a TXT record to your domain's DNS:
   - **Type**: TXT
   - **Name**: `@` (or your domain name)
   - **Value**: The verification code from Google
3. Wait for DNS propagation (can take up to 48 hours)
4. Click "Verify" in Search Console

---

## After Verification

Once verified:

1. ✅ **Submit your sitemap:**
   - Go to: Sitemaps section
   - Enter: `sitemap.xml`
   - Click "Submit"

2. ✅ **Enable email notifications:**
   - Go to: Settings > Users and permissions
   - Add your email
   - Enable notifications

3. ✅ **Start monitoring:**
   - Check Performance report weekly
   - Monitor for errors
   - Track rankings

---

## Troubleshooting

### Verification Fails

- **Check deployment**: Make sure changes are live on production
- **Check meta tag**: Verify it's in the `<head>` section
- **Clear cache**: Try incognito/private browsing mode
- **Wait a few minutes**: Sometimes takes time to propagate

### Can't Find Verification Code

- Make sure you selected "HTML tag" method
- Check the verification page in Search Console
- Try a different verification method if needed

---

**Note**: Replace `YOUR_VERIFICATION_CODE_HERE` with your actual verification code from Google Search Console.

