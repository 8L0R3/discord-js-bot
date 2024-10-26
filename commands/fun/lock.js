const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lock")
        .setDescription('Verrouille le salon pour empêcher les membres d\'envoyer des messages.'),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return await interaction.reply({ content: "Vous n'avez pas la permission de verrouiller ce salon.", ephemeral: true });
        }

        try {
            const everyoneRole = interaction.guild.roles.everyone;
            await interaction.channel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: false
            });
            await interaction.reply({ content: "Ce salon a été verrouillé.", ephemeral: true });
        } catch (error) {
            console.error('Erreur lors du verrouillage du salon :', error);
            await interaction.reply({ content: "Une erreur s'est produite lors du verrouillage du salon.", ephemeral: true });
        }
    },
};