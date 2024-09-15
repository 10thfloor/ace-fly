export function generateGitHubActionsWorkflow(appName: string) {
    return `
  name: Deploy to Fly.io
  
  on:
    push:
      branches:
        - main
  
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - name: Setup Node.js
          uses: actions/setup-node@v2
          with:
            node-version: '14'
        - name: Install Dependencies
          run: npm install
        - name: Deploy to Fly.io
          run: flyctl deploy --app ${appName} --remote-only
          env:
            FLY_API_TOKEN: \${{ secrets.FLY_API_TOKEN }}
    `;
  }