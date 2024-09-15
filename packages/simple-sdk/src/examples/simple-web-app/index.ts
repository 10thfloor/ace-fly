import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req: any, res: any) => {
  res.send('Hello from Fly.io!');
});

app.get('/api/data', (req: any, res: any) => {
  res.json({ message: 'This is your data.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});