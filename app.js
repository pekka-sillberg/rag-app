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

// Process SIGNAL handlers for graceful stopping
process.on("SIGINT", closeHandler);
process.on("SIGTERM", closeHandler);

// Call on above mentioned signals
function closeHandler(event) {
  console.log(`Closing server by event ${event}`);
  server?.close(closeCallback);
}

// Logger callback for the express server
function closeCallback(err){
  if (!err) {
    console.log(`Server successfully closed.`);
    process.exit(0);
  } else {
    console.log("an error happened", err);
    process.exit(2);
  }
}
