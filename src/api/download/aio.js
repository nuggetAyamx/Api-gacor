const axios = require('axios');

const BASE_URL = 'https://getdl.space';
const API_ENDPOINT = `${BASE_URL}/api/download`;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
  'Referer': `${BASE_URL}/id`,
  'Origin': BASE_URL,
  'Content-Type': 'application/json',
  'Accept': 'application/json, text/plain, */*',
  'Cookie': 'NEXT_LOCALE=id'
};

module.exports = function (app) {
  app.get("/download/getdl", async (req, res) => {
    const { apikey, url } = req.query;

    if (!apikey || apikey.trim() !== "uget") {
      return res.status(403).json({
        status: false,
        message: "Parameter 'apikey' tidak valid.",
        creator: "ibnu"
      });
    }

    if (!url || url.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Parameter 'url' (link video) wajib diisi.",
        creator: "ibnu"
      });
    }

    try {
      const response = await axios.post(API_ENDPOINT,
        { url: url.trim() },
        {
          headers: HEADERS,
          responseType: 'json',
          timeout: 30000
        }
      );

      return res.json({
        status: true,
        creator: "ibnu",
        data: response.data,
        url: url.trim(),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("[AIODL]", error.message);

      let errorMessage = "Gagal download video";
      if (error.response?.status === 400) {
        errorMessage = "URL tidak valid atau tidak didukung";
      } else if (error.response?.status === 404) {
        errorMessage = "Video tidak ditemukan";
      }

      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: errorMessage,
        error_detail: error.response?.data || null
      });
    }
  });
};
