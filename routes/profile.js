const express = require("express");
const router = express.Router();
const Profile = require("../models/profile.model");
const middleware = require("../middleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename : (req, file, cb) => {
        cb(null, req.decoded.username + ".jpg");
    },
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
    }
    else{
        cb(new Error("Only JPEG and PNG files are allowed"), false);
    }
};

const upload = multer({
    storage : storage,
    limits: {
        fileSize : 1024 * 1024 * 6,
    },
    fileFilter : fileFilter,
});

//Route to add image
router.route("/add/image").patch(middleware.checkToken, upload.single("img"), async(req, res) => {
    try {
        // Ensure file was uploaded
        if (!req.file) {
            return res.status(400).json({ msg: "No image file uploaded" });
        }

        // Update the profile with the image path
        const updatedProfile = await Profile.findOneAndUpdate(
            { username: req.decoded.username }, // Filter by username
            { $set: { img: req.file.path } }, // Update image path
            { new: true } // Return the updated document
        );

        // Check if profile exists
        if (!updatedProfile) {
            return res.status(404).json({ msg: "Profile not found" });
        }

        return res.status(200).json({
            msg: "Image added successfully",
            data: updatedProfile,
        });
    } catch (err) {
        return res.status(500).json({
            msg: "Failed to add image",
            error: err.message,
        });
    }
});

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