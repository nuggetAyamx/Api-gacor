const axios = require("axios");

module.exports = function (app) {
  app.get("/ai/ai4chat", async (req, res) => {
    const { apikey, q } = req.query;
    
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
    
    if (!q || q.trim() === "") {
      return res.status(400).json({
        status: false,
        creator: "ibnu",
        message: "Parameter 'q' (pertanyaan) wajib diisi."
      });
    }
    
    try {
      const apiUrl = `https://ikyyzyyrestapi.my.id/ai/ai4chat/chat?apikey=kyzz&question=${encodeURIComponent(q.trim())}`;
      
      const { data } = await axios.get(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10)"
        },
        timeout: 30000
      });

      return res.json({
        status: true,
        creator: "ibnu",
        data: {
          question: q.trim(),
          answer: data.result,
          source: "AI4Chat"
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("[AI CHAT]", error.message);
      
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal memproses pertanyaan AI"
      });
    }
  });
};
