const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectToMongoDB } = require('./config/MongoDB.js');
const embeddingRoutes = require('./routes/embedding.js');
dotenv.config();
const path = require('path');



const app = express();


app.use(express.json());
const corsOpts = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'HEAD', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  exposedHeaders: ['Content-Type']
};

app.use(cors(corsOpts));

app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

app.use('/api', embeddingRoutes);


app.get('*', (req, res) => {
  if (!req.originalUrl.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
  }
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message,
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await connectToMongoDB();
  console.log(`Server is running on  http://localhost:${PORT}`);
});
