const express = require("express");
const User = require("../models/users.model");
const config = require("../configure");
const jwt = require("jsonwebtoken");
const middleware = require("../middleware")
const router = express.Router();

router.route("/register").post((req, res) => {
    console.log("inside the register");

    const user = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
    });

    user
        .save()
        .then(() => {
            console.log("User Registered");
            // Send response once after successful registration
            return res.status(200).json({ message: "User Registered" });
        })
        .catch((err) => {
            console.error("Error registering user:", err);
            // Send error response in case of failure
            return res.status(403).json({ message: err.message });
        });
});


router.route("/update/:username").patch(async (req, res) => {
    try {
        const result = await User.findOneAndUpdate(
            { username: req.params.username },
            { $set: { password: req.body.password } },
            { new: true, useFindAndModify: false }
        );
        if (!result) {
            return res.status(404).json({ msg: "User not found" });
        }
        const msg = {
            msg: "Password successfully updated",
            username: req.params.username,
        };
        return res.json(msg);
    } catch (err) {
        return res.status(500).json({ msg: err });
    }
});

router.route("/delete/:username").delete(middleware.checkToken, async(req, res) => {
    try{
        const result = await User.findOneAndDelete(
            {username: req.params.username}
        );
        if(!result){
            return res.status(404).json({msg: "user not found"});
        }
        const msg ={
            msg : "username deleted",
        };
        return res.json(msg);
    } catch(err){
        return res.status(500).json({msg : err});
    }
});

router.route('/:username').get(middleware.checkToken, async (req, res) => {
    try {
        const result = await User.findOne({ username: req.params.username });
        if (!result) {
            return res.status(404).json({ msg: "User not found" });
        }
        res.json({
            data: result,
            username: req.params.username,
        });
    } catch (err) {
        res.status(500).json({ msg: err });
    }
});

router.route("/checkusername/:username").get(async (req, res) => {
    try {
        const result = await User.findOne({ username: req.params.username });
        if (result !== null) {
            return res.json({
                Status: true,
            });
        } else {
            return res.json({
                Status: false,
            });
        }
    } catch (err) {
        return res.status(500).json({ msg: err });
    }
});

router.route("/login").post(async (req, res) => {
    try {
        const result = await User.findOne({ username: req.body.username });
        if (!result) {
            return res.status(403).json("Username is incorrect");
        }
        if (result.password === req.body.password) {
            const token = jwt.sign({ username: req.body.username }, config.key, {
               // expiresIn: "24h",
            });

            return res.json({
                token: token,
                msg: "Success"
            });
        } else {
            return res.status(403).json("Password is incorrect");
        }
    } catch (err) {
        return res.status(500).json({ msg: err });
    }
});


module.exports = router;