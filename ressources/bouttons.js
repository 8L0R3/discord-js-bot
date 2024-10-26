const {EmbedBuilder, Events,AttachmentBuilder,Component,ChannelType,PermissionsBitField,ModalBuilder,TextInputBuilder,TextInputStyle,ActionRowBuilder,ButtonBuilder,StringSelectMenuBuilder,PermissionFlagsBits,ButtonStyle} = require("discord.js");

//---------------------------BTN pour les tickets----------------------------------
const claimButon = new ButtonBuilder()
    .setCustomId("claimticket")
    .setLabel("Fermer le Ticket")
    .setStyle(ButtonStyle.Danger)

const buttondelete = new ButtonBuilder()
    .setCustomId("btnDeleteTicket")
    .setLabel("Supprimer le Ticket")
    .setStyle(ButtonStyle.Danger);

const buttonUnclaim = new ButtonBuilder()
    .setCustomId("btnUnclaim")
    .setLabel("Rouvrir le tickets")
    .setStyle(ButtonStyle.Primary)

module.exports = {
    claimButon,
    buttonUnclaim,
    buttondelete,
}