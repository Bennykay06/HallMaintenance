require("dotenv").config();
const express = require("express");
const routes = require("./routes");
const app = express();
const PORT = 3000;

 app.use(express.json());
// Route

app.get("/", (req, res) => {
  res.send("Hello from Express 🚀");
});

// Import routes


// Use routes
app.use("/api", routes);


// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});