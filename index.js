const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const rentalRoutes = require("./routes/rentals");
const mongoose = require("mongoose");
const config = require("./config/dev");

const PORT = process.env.PORT || 3001;

// models
const Rental = require("./models/rental");

// Mongo DB
mongoose.connect(
  config.DB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  () => {
    console.log("connected to Mongo DB");
  }
);

// Middleware
app.use(bodyParser.json());

// API Routes
app.use("/api/v1/rentals", rentalRoutes);

app.listen(PORT, () => {
  console.log("server is listening on port: ", PORT);
});
