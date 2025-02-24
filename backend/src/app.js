import express, { json } from 'express';
import cors from 'cors';
import routes from './routes';
require('dotenv').config();

const app = express();

app.use(cors());
app.use(json());
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});