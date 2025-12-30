# BCV Rate API

Simple Express API to extract exchange rates from Banco Central de Venezuela (BCV) website.

## Features

- 🚀 Simple Express.js server
- 📊 Extracts BCV exchange rates from https://www.bcv.org.ve/
- 🔄 Returns JSON format
- ⚡ Fast and lightweight
- ☁️ Ready for Netlify deployment (serverless functions)

## Installation

```bash
npm install
```

## Usage

### Start the server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` by default.

### Endpoints

#### GET `/`
Returns API information and available endpoints.

#### GET `/health`
Health check endpoint.

#### GET `/api/rates`
Returns BCV exchange rates in JSON format.

**Example Response:**
```json
{
  "success": true,
  "date": "2024-01-15",
  "rates": {
    "USD": 36.15,
    "EUR": 39.20
  },
  "source": "https://www.bcv.org.ve/"
}
```

## Configuration

You can set the port using the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## Dependencies

- **express**: Web framework
- **axios**: HTTP client for fetching BCV website
- **cheerio**: HTML parsing and extraction
- **serverless-http**: Wrapper for Express apps in serverless environments

## Deployment to Netlify

This API is configured to deploy to Netlify as serverless functions.

### Prerequisites

1. A Netlify account (sign up at [netlify.com](https://www.netlify.com))
2. Netlify CLI installed (optional, for local testing):
   ```bash
   npm install -g netlify-cli
   ```

### Deployment Steps

#### Option 1: Deploy via Netlify Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [Netlify Dashboard](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your Git repository
5. Netlify will auto-detect the settings:
   - **Build command**: `npm install` (or leave empty)
   - **Publish directory**: Leave empty (not needed for functions only)
6. Click "Deploy site"

#### Option 2: Deploy via Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize and deploy:
   ```bash
   netlify init
   netlify deploy --prod
   ```

### Testing Locally with Netlify Dev

You can test the Netlify functions locally:

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Run Netlify dev server
netlify dev
```

This will start a local server that mimics Netlify's environment.

### Project Structure for Netlify

```
bcv-rate-api/
├── app.js                    # Express app (shared logic)
├── server.js                 # Local development server
├── netlify/
│   └── functions/
│       └── server.js        # Netlify serverless function
├── netlify.toml             # Netlify configuration
├── package.json
└── README.md
```

### API Endpoints on Netlify

Once deployed, your API will be available at:
- `https://your-site.netlify.app/` - API info
- `https://your-site.netlify.app/api/rates` - Get BCV rates
- `https://your-site.netlify.app/health` - Health check

All routes are handled by the single serverless function at `/.netlify/functions/server`.

## Notes

- The API scrapes the BCV website, so it depends on the website structure remaining stable
- If the BCV website structure changes, the extraction logic may need to be updated
- The API includes error handling and CORS headers for cross-origin requests
- Netlify Functions have a 10-second timeout on the free tier (26 seconds on Pro)
- For production, consider adding caching to reduce function execution time

## License

MIT

