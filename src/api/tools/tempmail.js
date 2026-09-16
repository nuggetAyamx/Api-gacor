const axios = require('axios');

const BASE_URL = 'https://tempmail-backend.hasnaintariq142.workers.dev';
const CREATE_INBOX_URL = `${BASE_URL}/api/create-inbox`;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
  'Referer': 'https://tempmail.chat/',
  'Origin': 'https://tempmail.chat',
  'Content-Type': 'application/json'
};

module.exports = function (app) {
  app.get("/tools/tempmail-create", async (req, res) => {
    const { apikey } = req.query;

    if (!apikey || apikey.trim() !== "uget") {
      return res.status(403).json({
        status: false,
        message: "Parameter 'apikey' tidak valid.",
        creator: "ibnu"
      });
    }

    try {
      const response = await axios.post(CREATE_INBOX_URL, null, { headers: HEADERS });

      if (!response.data.success) {
        throw new Error('Gagal membuat inbox');
      }

      return res.json({
        status: true,
        creator: "ibnu",
        data: {
          email: response.data.email,
          token: response.data.access_token,
          note: "Gunakan token di endpoint /tools/tempmail-check"
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("[TEMPMAIL CREATE]", error.message);
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal membuat inbox: " + error.message
      });
    }
  });
};
