const axios = require("axios");

module.exports = function (app) {
  app.get("/tools/subdomains", async (req, res) => {
    const { domain } = req.query;
    
    if (!domain || domain.trim() === "") {
      return res.status(400).json({
        status: false,
        creator: "ibnu",
        message: "Parameter 'domain' wajib diisi."
      });
    }

    try {
      const response = await axios.get(`https://api.siputzx.my.id/api/tools/subdomains?domain=${encodeURIComponent(domain.trim())}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10)"
        },
        timeout: 30000
      });

      const subdomains = response.data.data || [];

      return res.json({
        status: true,
        creator: "ibnu",
        data: {
          domain: domain.trim(),
          subdomains: subdomains,
          total: subdomains.length
        },
        source: "Subdomain Scanner",
        timestamp: response.data.timestamp || new Date().toISOString()
      });
      
    } catch (error) {
      console.error("[SUBDOMAIN SCANNER]", error.message);
      
      if (error.response?.status === 404) {
        return res.status(404).json({
          status: false,
          creator: "ibnu",
          message: "Domain tidak ditemukan."
        });
      }
      
      return res.status(500).json({
        status: false,
        creator: "ibnu",
        message: "Gagal melakukan scan subdomain"
      });
    }
  });
};
