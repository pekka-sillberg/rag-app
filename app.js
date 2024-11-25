require("dotenv").config();
const path = require("path");
const cors = require('cors');
const express = require("express");
const embeddingRoutes = require("./routes/embeddingRoutes");

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

const host = process.env.HOST || "127.0.0.1";
const port = process.env.PORT || 3000;
app.use("/api", embeddingRoutes);

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

var server = app.listen(port, host, (err) => {
  if (err) {
    console.log("Error in server setup", err);
  } else {
    console.log(`Server running at http://${host}:${port}`);
  }
});
