const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://tempmail-backend.hasnaintariq142.workers.dev';
const CHECK_INBOX_URL = `${BASE_URL}/api/inbox`;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
  'Referer': 'https://tempmail.chat/',
  'Origin': 'https://tempmail.chat',
  'Content-Type': 'application/json'
};

function cleanHtmlWithLinks(htmlString) {
  if (!htmlString) return { text: '', links: [] };

  const $ = cheerio.load(htmlString);

  $('script, style, meta, link, img').remove();

  const links = [];
  $('a').each((i, elem) => {
    const url = $(elem).attr('href');
    const text = $(elem).text().trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      links.push({ text: text || 'Link', url });
    }
  });

  let text = $.text();
  return {
    text: text.replace(/\n\s*\n/g, '\n\n').trim(),
    links
  };
}

module.exports = function (app) {
  app.get("/tools/tempmail-check", async (req, res) => {
    const { apikey, token, retries } = req.query;

    if (!apikey || apikey.trim() !== "uget") {
      return res.status(403).json({
        status: false,
        message: "Parameter 'apikey' tidak valid.",
        creator: "ibnu"
      });
    }

    if (!token || token.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Parameter 'token' wajib diisi.",
        creator: "ibnu"
      });
    }

    const maxRetries = parseInt(retries) || 6;

    try {
      let messages = [];

      for (let i = 1; i <= maxRetries; i++) {
        const response = await axios.get(CHECK_INBOX_URL, {
          params: { token: token.trim() },
          headers: HEADERS
        });

        if (response.data.success && response.data.messages && response.data.messages.length > 0) {
          messages = response.data.messages.map(msg => {
            const { text, links } = cleanHtmlWithLinks(msg.html_body);
            return {
              sender_name: msg.sender_name || null,
              sender: msg.sender,
              subject: msg.subject,
              received_at: msg.received_at,
              body: text,
              links: links
            };
          });
          break;
        }

        if (i < maxRetries) {
          await new Promise(r => setTimeout(r, 5000));
        }
      }

      if (messages.length === 0) {
        return res.status(404).json({
          status: false,
          creator: "ibnu",
          message: "Tidak ada email masuk dalam waktu yang ditentukan."
        });
      }

      return res.json({
        status: true,
        creator: "ibnu",
        data: {
          total: messages.length,
          messages: messages
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("[TEMPMAIL CHECK]", error.message);
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal cek inbox: " + error.message
      });
    }
  });
};
