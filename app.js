const express = require("express");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const db = require("./config/db");
const bucket = require("./config/storage");
const app = express();
const PORT = 3000;

// Static + View
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// Multer config (upload ảnh local tạm thời)
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Page 1: Upload
app.get("/upload", (req, res) => {
  res.render("upload");
});

app.post("/upload", upload.single("image"), async (req, res) => {
  const { title, description } = req.body;
  const localPath = req.file?.path;
  const cloudFilename = "images/" + req.file?.filename;

  console.log("start upload");
  console.log("Local path:", localPath);
  console.log("Cloud path:", cloudFilename);

  try {
    await bucket.upload(localPath, {
      destination: cloudFilename,
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${cloudFilename}`;
    console.log("Public URL:", publicUrl);

    db.query(
      "INSERT INTO images (title, description, url) VALUES (?, ?, ?)",
      [title, description, publicUrl],
      (err) => {
        if (err) {
          console.error("DB insert error:", err);
          return res.status(500).send("Database error");
        }
        res.redirect("/gallery");
      }
    );
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).send("Upload failed");
  }
});

// Page 2: Gallery
app.get("/gallery", (req, res) => {
  db.query("SELECT * FROM images ORDER BY created_at DESC", (err, results) => {
    if (err) {
      console.error("Error fetching images:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.render("gallery", { images: results });
  });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
