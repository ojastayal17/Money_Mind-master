import express from "express";
import multer from "multer";
import cors from "cors";
import Tesseract from "tesseract.js";
import dotenv from "dotenv";
import chatRoute from "./routes/chat.js"; // chatbot route

dotenv.config();

const app = express();

// ✅ UPDATED CORS (Allows both localhost & your network IP frontend)
app.use(
  cors({
    origin: "*", // allow all for now (safe in development)
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// ✅ Enable JSON body
app.use(express.json());

// ---------- MULTER SETUP (OCR UPLOAD) ----------
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Unsupported file type. Please upload JPG or PNG only."));
    }
    cb(null, true);
  },
});

// ---------- TEST ROUTE ----------
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

// ---------- OCR ROUTE ----------
app.post("/ocr-upload", upload.single("receipt"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Please upload a receipt image." });

    const result = await Tesseract.recognize(req.file.path, "eng");

    res.json({ text: result.data.text });
  } catch (error) {
    console.error("OCR error:", error);
    res.status(500).json({ error: "OCR failed" });
  }
});

// ---------- CHATBOT ROUTE ----------
app.use("/api", chatRoute);

// ---------- START SERVER ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running → http://localhost:${PORT}`)
);
