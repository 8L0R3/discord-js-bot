const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { waitingList } = require('./index');
const { logChannelId } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('terminer')
        .setDescription('Déconnecte un utilisateur de la vocal et le supprime de la liste d\'attente.')
        .addUserOption(option => 
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à déconnecter')
                .setRequired(true)),
    async execute(interaction) {
        const userToDisconnect = interaction.options.getUser('utilisateur');
        const memberToDisconnect = await interaction.guild.members.fetch(userToDisconnect.id);

        if (memberToDisconnect.voice.channel) {
            await memberToDisconnect.voice.disconnect();

            // Supprimer de la liste d'attente s'il y est
            const index = waitingList.indexOf(memberToDisconnect.id);
            if (index > -1) {
                waitingList.splice(index, 1);
            }

            // Envoyer les logs
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('Commande /terminer exécutée')
                    .addFields(
                        { name: 'Commande exécutée par', value: interaction.user.tag },
                        { name: 'Utilisateur déconnecté', value: memberToDisconnect.user.tag }
                    )
                    .setColor(0xFF0000)  // Rouge en hexadécimal
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            }

            return interaction.reply({ content: `${memberToDisconnect.user.tag} a été déconnecté et retiré de la liste d'attente.` });
        } else {
            return interaction.reply({ content: `${userToDisconnect.tag} n'est pas dans un salon vocal.`, ephemeral: true });
        }
    }
};
