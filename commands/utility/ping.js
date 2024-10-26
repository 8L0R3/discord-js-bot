const {SlashCommandBuilder, PermissionFlagsBits} = require("discord.js")

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Affiche le ping du bot")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: "utility",
    async execute(interaction) {
        await interaction.reply("Ping..."); // Send initial response
        const ping = Date.now() - interaction.createdTimestamp; // Calculate the ping
        await interaction.editReply(`Ping: ${ping}ms`); // Edit the initial response with the ping
    },
};