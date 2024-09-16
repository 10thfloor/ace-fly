import * as sdk from "@ace-flyv2/simple-sdk";
const logger = new sdk.Logger();
const apps = []; // Initialize with your list of apps if any
const cleanupManager = new sdk.CleanupManager(apps, logger);
async function deploy() {
    const myApp = new sdk.App({
        name: "test-app", // Replace with your actual app name
        region: ["iad", "lhr"], // Primary and additional regions
        environment: "development",
        cleanupManager, // Pass the CleanupManager instance
    });
    const myDatabase = new sdk.Database({
        appName: myApp.name,
        name: "your-database-name",
        engine: "postgres",
        version: "13",
        region: "iad",
        cleanupManager, // Pass the CleanupManager instance
    });
    const webMachine = new sdk.Machine({
        appName: myApp.name,
        name: "web-machine",
        image: "node:14-alpine",
        databases: [myDatabase],
        cleanupManager, // Pass the CleanupManager instance
    });
    const security = new sdk.Security({
        appName: myApp.name,
        logger,
        cleanupManager, // Pass the CleanupManager instance
    });
    try {
        // Create the app with the primary region and add additional regions
        await myApp.create();
        // Set environment variables
        await myApp.setEnv("NODE_ENV", "development");
        await myApp.setEnv("API_KEY", "your-actual-api-key");
        // Initialize the database
        await myDatabase.create();
        await myDatabase.connect();
        // Set up the web machine
        await webMachine.create();
        await webMachine.deploy();
        // Configure security settings
        // await security.addCustomDomain("yourdomain.com"); // Uncomment if needed
        await security.enforceHTTPS();
        // Deploy the application
        await myApp.deploy();
        // Scale the application
        await myApp.scale(3); // Scale to 3 machines in the primary region
        // Optionally, scale machines in additional regions
        for (const region of myApp.regions.slice(1)) {
            await myApp.scale(1, region); // Scale to 1 machine in each additional region
        }
        logger.success("Deployment completed successfully.");
    }
    catch (error) {
        logger.error(`Deployment failed: ${error.message}`);
        logger.info("Initiating cleanup of created resources...");
        await cleanupManager.cleanup();
        logger.info("Cleanup completed.");
        throw error; // Re-throw the error after cleanup
    }
}
deploy().catch((err) => {
    logger.error(err.message);
});
