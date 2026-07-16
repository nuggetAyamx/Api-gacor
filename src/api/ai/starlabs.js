const axios = require("axios");

module.exports = function (app) {
  app.get("/ai/starlabs", async (req, res) => {
    const { apikey, message } = req.query;

    if (!apikey || apikey.trim() !== "uget") {
      return res.status(403).json({
        status: false,
        message: "Parameter 'apikey' tidak valid.",
        creator: "ibnu"
      });
    }

    if (!message || message.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Parameter 'message' (pesan) wajib diisi.",
        creator: "ibnu"
      });
    }

    try {
      const { data } = await axios.get(`https://api-nanzz.my.id/docs/api/ai/starlabs-ai.php?message=${encodeURIComponent(message.trim())}`);

      if (!data.status) {
        return res.status(500).json({
          status: false,
          message: "Gagal mendapatkan respons dari StarLabs AI",
          creator: "ibnu"
        });
      }

      return res.json({
        status: true,
        creator: "ibnu",
        data: {
          input: data.input,
          response: data.result
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("[STARLABS AI]", error.message);
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal menghubungi StarLabs AI API"
      });
    }
  });
};
