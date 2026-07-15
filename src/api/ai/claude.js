const axios = require("axios");

module.exports = function (app) {
  app.get("/ai/claude", async (req, res) => {
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
      const { data } = await axios.get(`https://nugget-ai-beta.vercel.app/api/chat?q=${encodeURIComponent(q.trim())}`);

      if (!data.status) {
        return res.status(500).json({
          status: false,
          message: "Gagal mendapatkan respons dari Claude AI",
          creator: "ibnu"
        });
      }

      return res.json({
        status: true,
        creator: "ibnu",
        data: {
          response: data.result
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("[CLAUDE AI]", error.message);
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal menghubungi Claude AI API"
      });
    }
  });
};
