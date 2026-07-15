const axios = require("axios");

module.exports = function (app) {
  app.get("/ai/deepseek", async (req, res) => {
    const { apikey, prompt, system, temperature } = req.query;
    
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
    
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({
        status: false,
        creator: "ibnu",
        message: "Parameter 'prompt' (pertanyaan) wajib diisi."
      });
    }

    try {
      let apiUrl = `https://api.siputzx.my.id/api/ai/deepseekr1?prompt=${encodeURIComponent(prompt.trim())}`;
      
      if (system && system.trim() !== "") {
        apiUrl += `&system=${encodeURIComponent(system.trim())}`;
      }
      
      if (temperature) {
        apiUrl += `&temperature=${encodeURIComponent(temperature)}`;
      }
      
      const response = await axios.get(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
          "Accept": "application/json"
        },
        timeout: 30000
      });

      const responseData = response.data;
      
      let answer = responseData.data?.response || responseData.response;
      
      const thinkMatch = answer.match(/<think>(.*?)<\/think>/s);
      let think = null;
      let cleanAnswer = answer;
      
      if (thinkMatch) {
        think = thinkMatch[1].trim();
        cleanAnswer = answer.replace(/<think>.*?<\/think>/s, '').trim();
      }

      return res.json({
        status: true,
        creator: "ibnu",
        data: {
          prompt: prompt.trim(),
          answer: cleanAnswer,
          think: think,
          system: system || "You are a helpful assistant",
          temperature: temperature || 0.7
        },
        source: "DeepSeek R1 AI",
        timestamp: responseData.timestamp || new Date().toISOString()
      });
      
    } catch (error) {
      console.error("[DEEPSEEK AI]", error.message);
      
      if (error.response) {
        return res.status(error.response.status).json({
          status: false,
          creator: "ibnu",
          message: `API Error: ${error.response.status}`
        });
      }
      
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal memproses permintaan DeepSeek AI"
      });
    }
  });
};
