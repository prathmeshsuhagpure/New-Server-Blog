const express = require("express");
const router = express.Router();
const BlogPost = require("../models/blogpost.model");
const middleware = require("../middleware");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, req.params.id + ".jpg");
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 6,
    },
});


router.route("/add/coverImage/:id").patch(middleware.checkToken, upload.single("img"), async (req, res) => {
    try {
        const result = await BlogPost.findByIdAndUpdate(
            req.params.id,
            { $set: { coverImage: req.file.path } },
            { new: true }
        );
        if (!result) {
            return res.status(404).json({ error: "Blog post not found" });
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});



/* router.route("/add/coverImage/:id").patch(middleware.checkToken, upload.single("img"), async (req, res) => {
    try {
        const result = await BlogPost.findOneAndUpdate(
            { id: req.params.id },
            { $set: { coverImage: req.file.path } },
            { new: true }
        );
        res.json(result);
        console.log(result);

    } catch (err) {
        console.log(err);
        res.json(err);
    }
}); */


/* router.route("/add/coverImage/:id").patch(middleware.checkToken, upload.single("img"), (req, res) => {
    BlogPost.findOneAndUpdate({ id: req.params.id }, {
        $set: {
            coverImage: req.file.path,
        },
    },
        { new: true },
        (err, result) => {
            if (err) return res.json(err);
            return res.json(result);
        }
    );
}); */

/* router.route("/add/coverImage/:id").patch(
    middleware.checkToken,
    upload.single("img"),
    async (req, res) => {
        try {
            // Validate the uploaded file
            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded." });
            }

            // Convert the id parameter to an ObjectId
            const objectId = mongoose.Types.ObjectId.isValid(req.params.id)
                ? mongoose.Types.ObjectId(req.params.id)
                : null;

            if (!objectId) {
                return res.status(400).json({ error: "Invalid ID format." });
            }

            // Find and update the blog post
            const updatedPost = await BlogPost.findOneAndUpdate(
                { _id: objectId },
                {
                    $set: {
                        coverImage: req.file.path, // Save the file path
                    },
                },
                { new: true } // Return the updated document
            );

            if (!updatedPost) {
                return res.status(404).json({ error: "Blog post not found." });
            }

            // Respond with the updated post
            return res.status(200).json(updatedPost);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal server error." });
        }
    }
); */


router.route("/add").post(middleware.checkToken, (req, res) => {
    // Create a new blog post instance
    const blogpost = new BlogPost({
        username: req.decoded.username,
        title: req.body.title,
        body: req.body.body,
    });

    // Save the blog post and handle errors properly
    blogpost
        .save()
        .then((result) => {
            res.json({ data: result["_id"] });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ err: "An error occurred while saving the blog post." });
        });
});

router.route("/getOwnBlog").get(middleware.checkToken, async (req, res) => {
    try {
        const result = await BlogPost.find({ username: req.decoded.username });
        res.json({ data: result });
    } catch (err) {
        console.log(err);
        res.json(err);
    }
});

router.route("/getOthersBlog").get(middleware.checkToken, async (req, res) => {
    try {
        const result = await BlogPost.find({ username: { $ne: req.decoded.username } });
        res.json({ data: result });
    } catch (err) {
        console.error("Error fetching other users' blogs: ", err);
        res.status(500).json({ error: 'An error occurred while fetching the blogs' });
    }
});


router.route("/delete/:id").delete(middleware.checkToken, async (req, res) => {
    try {
        const result = await BlogPost.findOneAndDelete({
            $and: [{ username: req.decoded.username }, { _id: req.params.id }]
        });
        if (result) {
            console.log(result);
            return res.json("Blog Deleted");
        }
        return res.json("Blog not Deleted");
    } catch (err) {
        console.log(err);
        return res.json(err);
    }
});


module.exports = router;