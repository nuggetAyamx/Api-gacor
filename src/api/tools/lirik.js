const axios = require("axios");

module.exports = function (app) {
  app.get("/tools/lirik", async (req, res) => {
    const { apikey, title } = req.query;

    if (!apikey || apikey.trim() !== "uget") {
      return res.status(403).json({
        status: false,
        message: "Parameter 'apikey' tidak valid.",
        creator: "ibnu"
      });
    }

    if (!title || title.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Parameter 'title' (judul lagu) wajib diisi.",
        creator: "ibnu"
      });
    }

    try {
      const apiUrl = `https://api.cuki.biz.id/api/tools/lirik?apikey=cuki-x&title=${encodeURIComponent(title.trim())}`;
      const { data } = await axios.get(apiUrl);

      const { creator, timestamp, ...cleanData } = data;

      return res.json({
        status: true,
        creator: "ibnu",
        data: cleanData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("[LIRIK]", error.message);
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal mencari lirik lagu"
      });
    }
  });
};
