const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

const BOOSTER_ROLE_ID = '1259569881607835803';  // Remplacez par l'ID du rôle de boost
const THANK_YOU_CHANNEL_ID = '1299069039196241951';  // Remplacez par l'ID du salon où envoyer le message de remerciement
const EMBED_IMAGE_URL = 'https://i.pinimg.com/originals/27/aa/2e/27aa2eb411314bc576b284b658e683ff.gif';  // URL de l'image à afficher en haut à droite de l'embed

module.exports = {
    data: new SlashCommandBuilder()
        .setName('boost')
        .setDescription('Test the boost thank you embed'),
    
    async execute(interaction) {
        // Récupère le membre qui a exécuté la commande
        const member = interaction.member;
        const guild = interaction.guild;
        const thankYouChannel = guild.channels.cache.get(THANK_YOU_CHANNEL_ID);

        if (thankYouChannel) {
            const embed = new EmbedBuilder()
                .setColor('#FF73FA')
                .setTitle('Merci pour le Boost !')
                .setDescription(`${member} vient de booster le serveur !\n\n**${guild.name}** est maintenant au niveau **${guild.premiumTier}** avec **${guild.premiumSubscriptionCount}** boosts !`)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setImage(EMBED_IMAGE_URL)
                .setTimestamp()
                .setFooter({ text: `Nous avons maintenant ${guild.premiumSubscriptionCount} boosts!` });

            await thankYouChannel.send({ embeds: [embed] });

            await interaction.reply({ content: 'Embed de test envoyé avec succès!', ephemeral: true });
        } else {
            console.error('Le salon de remerciement spécifié n\'a pas été trouvé.');
            await interaction.reply({ content: 'Le salon de remerciement n\'a pas été trouvé.', ephemeral: true });
        }
    }
};
