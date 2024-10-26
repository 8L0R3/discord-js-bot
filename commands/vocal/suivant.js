const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { waitingList } = require('./index');
const { logChannelId } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suivant')
        .setDescription('Déplace la première personne de la liste d\'attente dans le salon vocal actuel.'),
    async execute(interaction) {
        const memberId = waitingList.shift(); // Déplacer la première personne de la liste d'attente

        if (!memberId) {
            return interaction.reply({ content: 'La liste d\'attente est vide.', ephemeral: true });
        }

        const member = await interaction.guild.members.fetch(memberId);

        if (!member) {
            return interaction.reply({ content: 'Membre non trouvé dans le serveur.', ephemeral: true });
        }

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: 'Vous devez être dans un salon vocal pour utiliser cette commande.', ephemeral: true });
        }

        await member.voice.setChannel(voiceChannel);

        // Envoyer les logs
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle('Commande /suivant exécutée')
                .addFields(
                    { name: 'Commande exécutée par', value: interaction.user.tag },
                    { name: 'Membre déplacé', value: member.user.tag }
                )
                .setColor(0x00FF00)  // Vert en hexadécimal
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        }

        return interaction.reply({ content: `${member.user.tag} a été déplacé dans votre salon vocal.` });
    }
};
