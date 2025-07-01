import express from 'express';
import sendInterviewRouter from './api/sendInterview.js';

const app = express();
app.use(express.json());

app.use('/api/sendInterview', sendInterviewRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
}); 