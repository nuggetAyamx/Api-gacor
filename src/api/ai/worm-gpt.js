const axios = require("axios");

module.exports = function (app) {
  app.get("/ai/worm-gpt", async (req, res) => {
    const { apikey, prompt } = req.query;

    if (!apikey || apikey.trim() !== "uget") {
      return res.status(403).json({
        status: false,
        message: "Parameter 'apikey' tidak valid.",
        creator: "ibnu"
      });
    }

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Parameter 'prompt' (pertanyaan) wajib diisi.",
        creator: "ibnu"
      });
    }

    try {
      const { data } = await axios.get(`https://api-nanzz.my.id/docs/api/ai/worm-gpt.php?prompt=${encodeURIComponent(prompt.trim())}`);

      if (!data.status) {
        return res.status(500).json({
          status: false,
          message: "Gagal mendapatkan respons dari Worm GPT",
          creator: "ibnu"
        });
      }

      return res.json({
        status: true,
        creator: "ibnu",
        data: {
          model: data.result.model,
          prompt: data.result.prompt,
          response: data.result.response,
          warning: data.result.warning
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("[WORM GPT]", error.message);
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Worm GPT Gagal merespon cobalagi nanti"
      });
    }
  });
};
