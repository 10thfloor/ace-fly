import { App } from './src/constructs/App';
import { Machine } from './src/constructs/Machine';
import { Database } from './src/constructs/Database';

const myApp = new App({
  name: 'my-fly-app',
  region: ['iad', 'lhr'], // Example regions: Washington DC, London Heathrow
  envVars: {
    NODE_ENV: 'production',
    API_KEY: 'your-api-key',
  },
});

const myDatabase = new Database({
  appName: 'my-fly-app',
  name: 'my-database',
  engine: 'postgres',
  version: '13',
  region: 'iad',
});

const webMachine = new Machine({
  appName: 'my-fly-app',
  name: 'web-machine',
  image: 'node:14-alpine',
  envVars: {
    DATABASE_URL: 'postgres://user:password@hostname:5432/dbname',
  },
});

async function deployApp() {
  await myApp.deploy();
  await myDatabase.create();
  await myDatabase.connect();
  await webMachine.create();
  await webMachine.deploy();
  await myApp.scale(3); // Scale to 3 machines
}

deployApp().catch((err) => {
  console.error(err);
});