const express = require("express");
const router = express.Router();
const Profile = require("../models/profile.model");
const middleware = require("../middleware");

// Route to add a new profile
router.route("/add").post(middleware.checkToken, async (req, res) => {
    try {
        // Validate required Fields
        const { name, profession, DOB, titleline, about } = req.body;

        if (!name || !profession || !DOB || !titleline || !about) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        // create and save the profile
        const profile = new Profile({
            username: req.decoded.username,
            name,
            profession,
            DOB,
            titleline,
            about,
        });

        await profile.save();
        return res.status(201).json({ msg: "Profile successfully stored" })

    }
    catch (err) {
        return res.status(500).json({ erroe: "Failed to store profile", details: err.message });
    }

});

module.exports = router;