const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { clienttwitchId, clientSecret, twitchChannels, discordChannelId } = require('../config.json');

let accessToken = '';
let liveStatus = {}; // Object pour suivre l'état précédent des streams

// Fonction pour obtenir un token d'accès à l'API Twitch
async function getTwitchAccessToken() {
    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: clienttwitchId,
                client_secret: clientSecret,
                grant_type: 'client_credentials',
            },
        });
        accessToken = response.data.access_token;
    } catch (error) {
        console.error('Erreur lors de l\'obtention du token Twitch:', error);
    }
}

// Fonction pour vérifier si une chaîne est en direct
async function checkIfLive(channelName) {
    try {
        const response = await axios.get(`https://api.twitch.tv/helix/streams`, {
            params: { user_login: channelName },
            headers: {
                'Client-ID': clienttwitchId,
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (response.data.data.length > 0) {
            return response.data.data[0]; // Retourne les données du stream
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Erreur lors de la vérification du live pour ${channelName}:`, error);
        return null;
    }
}

// Fonction pour envoyer l'annonce dans le salon Discord
async function announceLive(client, channelName, streamData) {
    if (!streamData) {
        console.error(`Aucune donnée de stream trouvée pour ${channelName}.`);
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle(`${channelName} est en live sur Twitch !`)
        .setDescription(`Regardez le live de ${channelName} maintenant : [Voir le live](https://twitch.tv/${channelName})`)
        .setColor("#800080")  // Utilisez une couleur hexadécimale
        .setThumbnail(streamData.thumbnail_url.replace("{width}", "320").replace("{height}", "180")) // Ajustez la taille du thumbnail
        .addFields({ name: 'Titre', value: streamData.title });

    const channel = client.channels.cache.get(discordChannelId);
    if (channel) {
        await channel.send({ embeds: [embed] });
    }
}

// Fonction principale pour vérifier toutes les chaînes
async function checkAllChannels(client) {
    for (const channelName of twitchChannels) {
        const streamData = await checkIfLive(channelName);
        const isLive = !!streamData;

        // Si le stream est en direct et qu'il n'était pas en direct précédemment, envoyer l'annonce
        if (isLive && !liveStatus[channelName]) {
            await announceLive(client, channelName, streamData);
        }

        // Mettre à jour l'état précédent
        liveStatus[channelName] = isLive;
    }
}

async function startTwitchAnnouncer(client) {
    await getTwitchAccessToken();
    await checkAllChannels(client); // Vérification initiale
}

// Fonction pour déclencher la vérification lorsque vous voulez (par exemple, lorsque le bot démarre)
async function onBotStartup(client) {
    await startTwitchAnnouncer(client);
}

// Exporter la fonction d'initialisation
module.exports = { onBotStartup };
