import express from 'express';
import * as sdk from '@ace-flyv2/simple-sdk';
const logger = new sdk.Logger();
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    logger.info('Hello from Fly.io!');
    res.send('Hello from Fly.io!');
});
app.get('/api/data', (req, res) => {
    res.json({ message: 'This is your data.' });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
