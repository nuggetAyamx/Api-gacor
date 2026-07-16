const axios = require("axios");

module.exports = function (app) {
  app.get("/ai/blackbox", async (req, res) => {
    const { apikey, q } = req.query;

    if (!apikey || apikey.trim() !== "uget") {
      return res.status(403).json({
        status: false,
        message: "Parameter 'apikey' tidak valid.",
        creator: "ibnu"
      });
    }

    if (!q || q.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Parameter 'q' (pertanyaan) wajib diisi.",
        creator: "ibnu"
      });
    }

    try {
      const { data } = await axios.get(`https://api-nanzz.my.id/docs/api/ai/blackbox.php?q=${encodeURIComponent(q.trim())}`);

      return res.json({
        status: true,
        creator: "ibnu",
        data: data,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("[BLACKBOX AI]", error.message);
      
      let errorMessage = "Gagal mendapatkan respons dari Blackbox AI";
      if (error.response?.status === 404) {
        errorMessage = "Endpoint Blackbox AI tidak ditemukan";
      } else if (error.response?.status === 500) {
        errorMessage = "Server Blackbox AI mengalami error";
      }

      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: errorMessage
      });
    }
  });
};
