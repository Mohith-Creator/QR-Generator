const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const qr = require("qr-image");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Cloudinary Config (Use environment variables)
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

console.log("🔹 Cloudinary Config:", cloudinary.config().cloud_name);

// ✅ Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "qr-uploads",
    format: async () => "png",
    public_id: () => String(Date.now()), // Ensure it's a string
  },
});

const upload = multer({ storage });

// ✅ File Upload Endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  console.log("📩 Received file upload request");

  if (!req.file) {
    console.error("❌ No file uploaded.");
    return res.status(400).json({ error: "No file uploaded." });
  }

  console.log("📂 Uploaded file details:", req.file);
  res.json({ fileUrl: req.file.path }); // Cloudinary URL
});

// ✅ QR Code Generation Endpoint
app.post("/generate", (req, res) => {
  const { url } = req.body;
  console.log("🔹 Received request with URL:", url);

  if (!url) {
    console.error("❌ Error: No URL received");
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    console.log(`✅ Generating QR for: ${url}`);
    const qrImage = qr.image(url, { type: "png" });

    // 📥 Force download in browser
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", 'attachment; filename="qr_code.png"');

    qrImage.pipe(res);
  } catch (error) {
    console.error("❌ Error generating QR code:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
