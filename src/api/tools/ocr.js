const axios = require("axios");

module.exports = function (app) {
  app.get("/tools/ocr", async (req, res) => {
    const { apikey, imgUrl } = req.query;

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

    if (!imgUrl || imgUrl.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Parameter 'imgUrl' (URL gambar) wajib diisi.",
        creator: "ibnu"
      });
    }

    try {
      const apiUrl = `https://smail.my.id/ocr?imgUrl=${encodeURIComponent(imgUrl.trim())}`;
      const { data } = await axios.get(apiUrl);
      
      const parsedText = data.ParsedResults?.[0]?.ParsedText || "";
      
      return res.json({
        status: true,
        creator: "ibnu",
        data: {
          text: parsedText.trim(),
          raw: data
        },
        query: imgUrl.trim(),
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("[OCR ERROR]", error.message);
      
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal melakukan OCR pada gambar"
      });
    }
  });
};
