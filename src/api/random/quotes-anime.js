const axios = require("axios");

module.exports = function (app) {
  app.get("/random/animequoted", async (req, res) => {
    try {
      const { data } = await axios.get(`https://api-varhad.my.id/random/animequoted`);

      const { creator, ...cleanData } = data;

      return res.json({
        status: true,
        creator: "ibnu",
        data: cleanData.result || cleanData.data || cleanData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("[ANIME QUOTE]", error.message);
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal mengambil random anime quote"
      });
    }
  });
};
