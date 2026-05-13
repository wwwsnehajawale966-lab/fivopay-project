import express from 'express';
const app = express();
app.get('/', (req, res) => res.send('Hello'));
app.listen(5001, () => console.log('Simple server on 5001'));
setTimeout(() => console.log('Timeout hit'), 10000);
