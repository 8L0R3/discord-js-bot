const { EmbedBuilder } = require('discord.js');

const BOOSTER_ROLE_ID = '1259569881607835803';  // Remplacez par l'ID du rôle de boost
const THANK_YOU_CHANNEL_ID = '1299069039196241951';  // Remplacez par l'ID du salon où envoyer le message de remerciement
const EMBED_IMAGE_URL = 'https://i.pinimg.com/originals/27/aa/2e/27aa2eb411314bc576b284b658e683ff.gif';  // URL de l'image à afficher en haut à droite de l'embed

module.exports = (client) => {
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        // Vérifie si le membre vient de recevoir le rôle de booster
        if (!oldMember.roles.cache.has(BOOSTER_ROLE_ID) && newMember.roles.cache.has(BOOSTER_ROLE_ID)) {
            const thankYouChannel = newMember.guild.channels.cache.get(THANK_YOU_CHANNEL_ID);

            if (thankYouChannel) {
                const embed = new EmbedBuilder()
                    .setColor('#d0276b')
                    .setTitle('Merci pour le Boost !')
                    .setDescription(`${newMember.user} vient de booster le serveur !\n\n**${newMember.guild.name}** est maintenant au niveau 		**${newMember.guild.premiumTier}** avec **${newMember.guild.premiumSubscriptionCount}** boosts !`)
                    .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
                    .setImage(EMBED_IMAGE_URL)
                    .setTimestamp()
                    .setFooter({ text: `Nous avons maintenant ${newMember.guild.premiumSubscriptionCount} boosts!` });

                thankYouChannel.send({ embeds: [embed] });
            } else {
                console.error('Le salon de remerciement spécifié n\'a pas été trouvé.');
            }
        }
    });
};
