const axios = require('axios');
const cheerio = require('cheerio');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

async function stalkYouTube(input) {
    const baseUrl = 'https://youtubetoolkit.com/tools/account-viewer';
    const fetchUrl = 'https://youtubetoolkit.com/tools/account-viewer/fetch';

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        'Referer': baseUrl,
        'Origin': 'https://youtubetoolkit.com'
    };

    try {
        const pageRes = await client.get(baseUrl, { headers });
        const html = pageRes.data;
        const csrfMatch = html.match(/'X-CSRF-TOKEN':\s*'([^']+)'/i) || html.match(/"X-CSRF-TOKEN":\s*"([^"]+)"/i);
        const csrfToken = csrfMatch ? csrfMatch[1] : null;

        if (!csrfToken) {
            return { status: false, message: 'Gagal menemukan CSRF Token' };
        }

        const response = await client.post(fetchUrl, { url: input }, {
            headers: {
                ...headers,
                'Content-Type': 'application/json',
                'X-Csrf-Token': csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (response.data && response.data.success) {
            return { status: true, data: response.data.data };
        } else {
            return { status: false, message: 'Gagal mengambil data akun', raw: response.data };
        }

    } catch (error) {
        return { status: false, message: error.message };
    }
}

module.exports = function (app) {
    app.get("/stalker/yt", async (req, res) => {
        const { apikey, username } = req.query;

        if (!apikey || apikey.trim() !== "uget") {
            return res.status(403).json({
                status: false,
                message: "Parameter 'apikey' tidak valid.",
                creator: "ibnu"
            });
        }

        if (!username || username.trim() === "") {
            return res.status(400).json({
                status: false,
                message: "Parameter 'username' (username YouTube) wajib diisi.",
                creator: "ibnu"
            });
        }

        try {
            const result = await stalkYouTube(username.trim());

            if (!result.status) {
                return res.status(404).json({
                    status: false,
                    creator: "ibnu",
                    message: result.message || "Akun YouTube tidak ditemukan"
                });
            }

            const data = result.data;

            const formattedData = {
                basic: {
                    username: data.username || data.channel_name || "Tidak diketahui",
                    channel_id: data.channel_id || null,
                    display_name: data.display_name || null,
                    joined_date: data.joined_date || null,
                    country: data.country || null
                },
                stats: {
                    subscribers: data.subscribers || data.subscriber_count || 0,
                    views: data.views || data.view_count || 0,
                    videos: data.videos || data.video_count || 0,
                    likes: data.likes || data.like_count || 0
                },
                about: {
                    description: data.description || data.about || "Tidak ada deskripsi",
                    links: data.links || data.social_links || [],
                    email: data.email || data.business_email || null
                },
                avatar: data.avatar || data.profile_pic || null,
                banner: data.banner || data.cover_photo || null,
                verified: data.verified || data.is_verified || false,
                raw: data
            };

            return res.json({
                status: true,
                creator: "ibnu",
                data: formattedData,
                username: username.trim(),
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error("[YOUTUBE STALK]", error.message);
            return res.status(500).json({
                status: false,
                creator: "ibnu",
                message: "Gagal mengambil data YouTube"
            });
        }
    });
};
