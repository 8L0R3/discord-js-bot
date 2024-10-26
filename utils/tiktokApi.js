const axios = require('axios');
const { tiktokClientKey, tiktokClientSecret, redirectUri } = require('../config.json'); // Assurez-vous que le chemin est correct

let accessToken = '';

async function getTikTokAccessToken(code) {
    try {
        const response = await axios.post('https://open-api.tiktok.com/oauth/access_token/', null, {
            params: {
                client_key: tiktokClientKey,
                client_secret: tiktokClientSecret,
                code: code,
                grant_type: 'authorization_code',
            },
        });

        accessToken = response.data.access_token;
        return accessToken;
    } catch (error) {
        console.error('Erreur lors de l\'obtention du token d\'accès TikTok:', error);
        return null;
    }
}

async function checkIfTikTokLive(accessToken, channelName) {
    try {
        const response = await axios.get('https://open-api.tiktok.com/v1/live/streams', {
            params: { user_login: channelName },
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (response.data.data && response.data.data.length > 0) {
            return response.data.data[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Erreur lors de la vérification du live pour ${channelName}:`, error);
        return null;
    }
}

module.exports = { getTikTokAccessToken, checkIfTikTokLive };
