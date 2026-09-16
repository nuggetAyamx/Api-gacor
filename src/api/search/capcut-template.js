const axios = require('axios');

const PROXY_API = 'https://api.ikyyxd.my.id/v2l/proxy-free/ikyy-xsample';
const BASE_URL = 'https://www.capcut.com';
const API_ENDPOINT = '/kep/api/getSimilarTemplates';

let proxies = [];

async function fetchProxies() {
    try {
        const res = await axios.get(PROXY_API, { timeout: 10000 });
        if (!Array.isArray(res.data)) throw new Error('Invalid proxy format');
        proxies = res.data.filter(p => typeof p === 'string' && p.trim().split(':').length === 4);
        if (proxies.length === 0) throw new Error('No valid proxies found');
    } catch (err) {
        throw new Error(`Proxy fetch failed: ${err.message}`);
    }
}

function getRandomProxyConfig() {
    const p = proxies[Math.floor(Math.random() * proxies.length)];
    const [host, port, user, pass] = p.trim().split(':');
    return {
        str: p,
        ip: host,
        config: {
            host,
            port: parseInt(port),
            auth: { username: user, password: pass },
            protocol: 'http'
        }
    };
}

async function searchTemplates(keyword, size = 10, language = 'en', regionCode = 'US', proxyData) {
    const client = axios.create({
        baseURL: BASE_URL,
        proxy: proxyData.config,
        timeout: 30000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Origin': BASE_URL,
            'Referer': `${BASE_URL}/template`,
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
        }
    });

    const payload = {
        keyword: keyword,
        tabs: ["video"],
        language: language,
        regionCode: regionCode,
        size: size
    };

    const res = await client.post(API_ENDPOINT, payload);

    if (res.data.status !== 1000 || !res.data.data?.videoTemplateList) {
        throw new Error(`API Error: ${JSON.stringify(res.data)}`);
    }

    const templates = res.data.data.videoTemplateList.videoTemplates || [];

    return templates.map(t => ({
        template_id: t.templateId,
        title: t.title,
        description: t.titleDesc,
        use_count: t.useCount,
        like_count: t.likeCount,
        comment_count: t.commentCount,
        duration: t.templateDuration,
        cover_url: t.coverUrl,
        video_url: t.videoUrl,
        structured_data: t.structuredData || null
    }));
}

module.exports = function (app) {
    app.get("/search/capcut", async (req, res) => {
        const { apikey, q, size, lang, region } = req.query;

        if (!apikey || apikey.trim() !== "uget") {
            return res.status(403).json({
                status: false,
                message: "Parameter 'apikey' tidak valid.",
                creator: "ibnu"
            });
        }

        if (!q || q.trim() === "") {
            return res.status(400).json({
                status: false,
                message: "Parameter 'q' (keyword) wajib diisi.",
                creator: "ibnu"
            });
        }

        const keyword = q.trim();
        const resultSize = parseInt(size) || 10;
        const language = lang || 'en';
        const regionCode = region || 'US';

        try {
            await fetchProxies();

            let success = false;
            let lastError = '';
            let results = [];
            let usedProxyIp = '';

            for (let i = 0; i < 5; i++) {
                let proxyData;
                try {
                    proxyData = getRandomProxyConfig();
                } catch (err) {
                    lastError = err.message;
                    continue;
                }

                usedProxyIp = proxyData.ip;

                try {
                    results = await searchTemplates(keyword, resultSize, language, regionCode, proxyData);
                    success = true;
                    break;
                } catch (err) {
                    lastError = err.message;
                }
            }

            if (!success) {
                return res.status(500).json({
                    status: false,
                    creator: "ibnu",
                    message: "Gagal mencari template CapCut",
                    error: lastError,
                    proxy_last_used: usedProxyIp
                });
            }

            return res.json({
                status: true,
                creator: "ibnu",
                data: {
                    keyword,
                    total_results: results.length,
                    templates: results,
                    proxy_ip: usedProxyIp
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error("[CAPCUT SEARCH]", error.message);
            return res.status(500).json({
                status: false,
                creator: "ibnu",
                message: "Gagal mencari template CapCut: " + error.message
            });
        }
    });
};
