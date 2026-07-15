const axios = require("axios");

module.exports = function (app) {
  app.get("/tools/ouo-bypass", async (req, res) => {
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
        message: "Parameter 'url' (link ouo.io) wajib diisi.",
        creator: "ibnu"
      });
    }

    try {
      const apiUrl = `https://api-nanzz.my.id/docs/api/tools/ouo-bypass.php?url=${encodeURIComponent(url.trim())}`;
      const { data } = await axios.get(apiUrl);

      const { creator, ...cleanData } = data;

      return res.json({
        status: true,
        creator: "ibnu",
        data: cleanData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("[OUO BYPASS]", error.message);
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal bypass link OUO"
      });
    }
  });
};
