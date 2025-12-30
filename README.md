# BCV Rate API

Simple Express API to extract exchange rates from Banco Central de Venezuela (BCV) website.

## Features

- 🚀 Simple Express.js server
- 📊 Extracts BCV exchange rates from https://www.bcv.org.ve/
- 🔄 Returns JSON format
- ⚡ Fast and lightweight

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

## Notes

- The API scrapes the BCV website, so it depends on the website structure remaining stable
- If the BCV website structure changes, the extraction logic may need to be updated
- The API includes error handling and CORS headers for cross-origin requests

## License

MIT

