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
app.use (express.urlencoded({extended: false}));
app.use("/uploads", express.static("uploads"));

// Middleware for error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
});


// Routes
const userRoute = require("../routes/user"); 
app.use("/.netlify/functions/index/user", userRoute);

const profileRoute = require("../routes/profile");
app.use("/.netlify/functions/index/profile", profileRoute);

const blogRoute = require("../routes/blogpost");
app.use("/.netlify/functions/index/blogpost", blogRoute);

// Root site
app.get("/.netlify/functions/index", (req, res) => res.json("My First REST API"));

// Site running on port
app.listen(Port, "0.0.0.0",() => console.log(`Server is running on port ${Port}`));

// Export for Netlify Functions
module.exports.handler = serverless(app);
