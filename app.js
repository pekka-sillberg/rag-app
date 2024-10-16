const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectToMongoDB } = require('./config/MongoDB.js');
const embeddingRoutes = require('./routes/embedding.js'); 
dotenv.config();


const app = express();


app.use(express.json()); 
const corsOpts = {
  origin: '*',
  credentials: true,
  methods: ['GET','POST','HEAD','PUT','PATCH','DELETE'],
  allowedHeaders: ['Content-Type'],
  exposedHeaders: ['Content-Type']
};
app.use(cors(corsOpts));



app.use('/api', embeddingRoutes); 


app.get('/', (req, res) => {
  res.send('Welcome to the Embedding API!');
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message,
  });
});


const PORT = process.env.PORT || 5000;


app.listen(PORT, async() => {
    await connectToMongoDB();
  console.log(`Server is running on  http://localhost:${PORT}`);
});
