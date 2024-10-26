const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Déverrouille le salon pour permettre aux membres d\'envoyer des messages.'),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return await interaction.reply({ content: "Vous n'avez pas la permission de déverrouiller ce salon.", ephemeral: true });
        }

        try {
            const everyoneRole = interaction.guild.roles.everyone;
            await interaction.channel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: true
            });
            await interaction.reply({ content: "Ce salon a été déverrouillé.", ephemeral: true });
        } catch (error) {
            console.error('Erreur lors du déverrouillage du salon :', error);
            await interaction.reply({ content: "Une erreur s'est produite lors du déverrouillage du salon.", ephemeral: true });
        }
    },
};