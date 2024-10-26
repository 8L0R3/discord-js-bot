const { Events, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Component } = require('discord.js');
const { client } = require("../index")
const { utilisateurSuspect, membreRole } = require("../ressources/tickets-ressources/generalServInfo.json")
async function userIsBotConfirmation(interaction, btnCustomId){
    const botBanInteraction = btnCustomId.split('_');
    const targetId = botBanInteraction[1]
    const guild = interaction.guild

    const targetUser = guild.members.cache.get(targetId)
    await targetUser.ban({reason: "Bot"})
    await interaction.reply("Le membre a été banni.")
}

async function userIsBotCancel(interaction, btnCustomId){
    const botBanInteraction = btnCustomId.split('_');
    const targetId = botBanInteraction[1]
    const guild = interaction.guild

    const targetUser = guild.members.cache.get(targetId)
    await targetUser.roles.remove(utilisateurSuspect)
    await targetUser.roles.add(membreRole)
    await targetUser.timeout(null)
    await interaction.reply("Le membre a été sorti de la quarantaine.")
}



module.exports = {
    userIsBotConfirmation,
    userIsBotCancel
}