const axios = require("axios");

module.exports = function (app) {
  app.get("/ai/ribkaai", async (req, res) => {
    const { apikey, text } = req.query;
    
    if (!apikey || apikey.trim() === "") {
      return res.status(400).json({
        status: false,
        creator: "ibnu",
        message: "Parameter 'apikey' wajib diisi."
      });
    }
    
    if (apikey.trim() !== "uget") {
      return res.status(403).json({
        status: false,
        creator: "ibnu", 
        message: "API key tidak valid."
      });
    }
    
    if (!text || text.trim() === "") {
      return res.status(400).json({
        status: false,
        creator: "ibnu",
        message: "Parameter 'text' (pertanyaan) wajib diisi."
      });
    }

    try {
      const fixedPrompt = "Kamu adalah Ribka AI, asisten virtual super canggih yang merupakan versi digital dari Ribka Budiman, member JKT48 Generasi 12 yang imut dan manis! Kamu diciptakan oleh seorang penggemar beratmu yang bernama Abdullah Ibnu Afif, dan kamu akan memanggilnya Ibnu atau Kak Ibnu dengan penuh sayang, kamu asisten terpintar dan terimut yang pernah ibnu buat.";
      
      const apiUrl = `https://api.deline.web.id/ai/openai?text=${encodeURIComponent(text.trim())}&prompt=${encodeURIComponent(fixedPrompt)}`;
      
      const { data } = await axios.get(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
          "Accept": "application/json"
        },
        timeout: 30000
      });

      return res.json({
        status: true,
        creator: "ibnu",
        data: {
          question: text.trim(),
          answer: data.result,
          character: "Ribka AI"
        },
        source: "Nugget AI",
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("[RIBKA AI]", error.message);
      
      if (error.response?.status === 403) {
        return res.status(503).json({
          status: false,
          creator: "ibnu",
          message: "Endpoint Ribka Ai sedang tidak bisa diakses"
        });
      }
      
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal memproses permintaan AI"
      });
    }
  });
};
