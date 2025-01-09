const express = require("express");
const router = express.Router();
const Profile = require("../models/profile.model");
const middleware = require("../middleware");
const multer = require("multer");
const path = require("path");


// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, req.decoded.username + ".jpg");
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG/JPG and PNG files are allowed"), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 6 }, // 6MB limit
    //fileFilter : fileFilter,
});

// Route to add image
router.patch(
    "/add/image",
    middleware.checkToken,
    upload.single("img"),
    async (req, res) => {
        try {
            // Ensure file is uploaded
             if (!req.file) {
                return res.status(400).json({ msg: "No image file uploaded" });
            } 

            // Update the profile
            const updatedProfile = await Profile.findOneAndUpdate(
                { username: req.decoded.username },
                { $set: { img: req.file.path } },
                { new: true } // Ensure it returns the updated document
            );

            // Success response
            return res.status(200).json({
                message: "Image successfully uploaded",
                data: updatedProfile,
            });
            
        } catch (err) {
            console.error("Error uploading image:", err.message);
            return res.status(500).json({ msg: "Failed to upload image", error: err.message });
        }
    }
);


// Route to add a new profile
router.post("/add", middleware.checkToken, async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        console.log("Decoded Token:", req.decoded);

        const { name, profession, DOB, titleline, about } = req.body;

        // Optional validation for required fields
        /* if (!name || !profession || !DOB || !titleline || !about) {
            return res.status(400).json({ msg: "All fields are required" });
        } */

        const profile = new Profile({
            username: req.decoded.username,
            name,
            profession,
            DOB: new Date(DOB).toLocaleDateString('en-GB'),
            titleline,
            about,
        });

        await profile.save();
        return res.status(201).json({ msg: "Profile successfully stored" });
    } catch (err) {
        console.error("Error saving profile:", err.message);
        return res.status(500).json({ msg: "Failed to save profile", error: err.message });
    }
});

// Route to check if profile exists
router.get("/checkProfile", middleware.checkToken, async (req, res) => {
    try {
        const profile = await Profile.findOne({ username: req.decoded.username });

        if (!profile) {
            return res.status(404).json({ status: false, message: "Profile not found", username: req.decoded.username });
        }

        return res.status(200).json({ status: true, message: "Profile exists", username: req.decoded.username });
    } catch (err) {
        console.error("Error fetching profile:", err.message);
        return res.status(500).json({ status: false, error: "Internal Server Error" });
    }
});

router.route("/getData").get(middleware.checkToken, async (req, res) => {
    try {
      // Fetch the profile based on the decoded username from the token
      const profile = await Profile.findOne({ username: req.decoded.username });
  
      // Check if a profile was found
      if (!profile) {
        return res.status(404).json({ data: [], message: "Profile not found" });
      }
  
      // Return the found profile data
      return res.status(200).json({ data: profile });
    } catch (err) {
      // Handle errors
      return res.status(500).json({ error: err.message });
    }
  });

  router.route("/update").patch(middleware.checkToken, async (req, res) => {
    try {
      // Find the profile associated with the username in the decoded token
      const profile = await Profile.findOne({ username: req.decoded.username });
  
      // If no profile is found, return an error
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
  
      // Update the profile with the provided data or retain the existing values
      const updatedProfile = await Profile.findOneAndUpdate(
        { username: req.decoded.username },
        {
          $set: {
            name: req.body.name || profile.name,
            profession: req.body.profession || profile.profession,
            DOB: req.body.DOB || profile.DOB,
            titleline: req.body.titleline || profile.titleline,
            about: req.body.about || profile.about,
          },
        },
        { new: true } // Return the updated document
      );
  
      // Return the updated profile data
      return res.status(200).json({ data: updatedProfile });
    } catch (err) {
      // Handle errors and return a server error response
      return res.status(500).json({ error: err.message });
    }
  });
  

module.exports = router;
