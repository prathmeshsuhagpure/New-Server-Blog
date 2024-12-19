const express = require("express");
const mongoose = require("mongoose");
const Port = process.env.port || 5000
const app = express();

//mongoose.connect('mongodb://127.0.0.1:27017/myapp');
mongoose.connect("mongodb+srv://prathmeshdevelopment:Pratham_MongoDB@cluster0.nfxq0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDb Connected");
});

app.use(express.json());
const userRoute = require("./routes/user");
app.use("/user", userRoute);

app.route("/").get((req, res) => res.json('My First REST API'));

app.listen(Port, () => console.log(`Server is running on port ${Port}`));
