# Simple Web App Deployment Example

This example demonstrates deploying a simple web application with an API and PostgreSQL database using the `simple-sdk`. The deployment includes setting up a custom domain, enforcing HTTPS, and targeting the 'development' environment.

## Prerequisites

- [Fly.io CLI](https://fly.io/docs/hands-on/install-flyctl/) installed and authenticated.
- `simple-sdk` installed.

## Setup

1. **Clone the repository and navigate to the example directory:**

   ```bash
   git clone https://github.com/your-repo.git
   cd your-repo/examples/simple-web-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Update Deployment Script:**

   - Open `deploy.ts` and update the `API_KEY`, `DATABASE_URL`, and `yourdomain.com` with your actual values.

## Deployment

Run the deployment script:

```bash
npm run deploy
```

This script will:

1. Deploy the app to Fly.io in the 'development' environment.
2. Set environment variables.
3. Set up a PostgreSQL database.
4. Deploy a web machine running the Express server.
5. Configure a custom domain and enforce HTTPS.
6. Scale the app to 3 instances.

## Verify Deployment

After deployment, open your app using Fly.io CLI:

```bash
flyctl apps list
flyctl open <app-name>
```
