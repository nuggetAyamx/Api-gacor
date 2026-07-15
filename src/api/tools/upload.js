const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "../../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = function (app) {
  app.post("/tools/upload", upload.single("file"), async (req, res) => {
    const { apikey } = req.query;

    if (!apikey || apikey.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Parameter 'apikey' wajib diisi.",
        creator: "ibnu"
      });
    }

    if (apikey.trim() !== "uget") {
      return res.status(403).json({
        status: false,
        message: "API key tidak valid.",
        creator: "ibnu"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "Tidak ada file yang diupload.",
        creator: "ibnu"
      });
    }

    try {
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      
      return res.json({
        status: true,
        creator: "ibnu",
        data: {
          originalname: req.file.originalname,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: fileUrl
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("[UPLOAD ERROR]", error.message);
      
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal upload file"
      });
    }
  });
};
