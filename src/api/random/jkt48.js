const axios = require("axios");

async function getRandomJKT48Audio() {
  try {
    const response = await axios.get(
      `https://smail.my.id/randomlagujkt48?type=buffer`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
          "Accept": "audio/*",
          "Referer": "https://smail.my.id/"
        },
        responseType: 'stream',
        timeout: 30000
      }
    );
    
    return response;
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error ${error.response.status}`);
    } else if (error.request) {
      throw new Error('No response received from API server');
    } else {
      throw new Error(`Request setup error: ${error.message}`);
    }
  }
}

module.exports = function (app) {
  app.get("/random/jkt48", async (req, res) => {
    const { apikey } = req.query;

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
        creator: "ibnu",
        note: "Gunakan API key: 'uget'"
      });
    }

    try {
      const response = await getRandomJKT48Audio();
      const contentType = response.headers['content-type'] || 'audio/mpeg';
      const contentLength = response.headers['content-length'];
      
      res.setHeader('Content-Type', contentType);
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }
      res.setHeader('Cache-Control', 'public, max-age=86400'); 
      res.setHeader('Creator', 'ibnu');
      
      response.data.pipe(res);
      
    } catch (error) {
      console.error(`Random JKT48 Audio Error: ${error.message}`);
      
      return res.status(500).json({
        status: false,
        message: "Gagal mendapatkan audio lagu JKT48",
        creator: "ibnu",
        timestamp: new Date().toISOString()
      });
    }
  });
};
