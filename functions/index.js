const express = require("express");
const mongoose = require("mongoose");
const serverless = require("serverless-http");

const Port = process.env.port || 5000

const app = express();

// MongoDB connection
mongoose.connect("mongodb+srv://prathmeshdevelopment:Pratham_MongoDB@cluster0.nfxq0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDB Connected");
});

// Middleware
app.use(express.json());

// Middleware for error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
});


// Routes
const userRoute = require("../routes/user"); // Adjust the path based on your folder structure
app.use("/.netlify/functions/server/user", userRoute);

app.get("/.netlify/functions/server", (req, res) => res.json("My First REST API"));

app.listen(Port, () => console.log(`Server is running on port ${Port}`));

// Export for Netlify Functions
module.exports.handler = serverless(app);
