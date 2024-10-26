const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { db } = require("../../events/connectDB");
const { sendError } = require("../../utils/sendErrorLogs");
const { revokeLogChannelId } = require('../../config.json');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("revoke")
        .setDescription("Permet de retirer une dérogation d'un ticket pour un membre.")
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("Le membre à qui retirer la dérogation.")
                .setRequired(true))
        .addChannelOption(option =>
            option
                .setName("ticket")
                .setDescription("Le ticket ciblé.")
                .setRequired(true))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: "utility",
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetMember = interaction.options.getUser("member");
        const targetTicket = interaction.options.getChannel("ticket");

        const récupQuery = `SELECT * FROM ticketinfos WHERE ticketId = '${targetTicket.id}'`;

        await db.query(récupQuery, async (err, data) => {
            if (err) {
                let where = "revoke ==> récup";
                await sendError(where, err);
                console.log("Une erreur est survenue lors de la récupération des données", err);
                await interaction.editReply({
                    content: "Une erreur est survenue lors de la récupération des données.",
                });
                return;
            }

            if (data.length > 0) {
                const channelId = data[0].ticketId;
                const guildId = data[0].guildId;
                const channelUrl = `https://discord.com/channels/${guildId}/${channelId}`;

                // Vérifier si le membre a déjà une dérogation
                const permissions = targetTicket.permissionOverwrites.cache;
                const existingPermission = permissions.get(targetMember.id);

                if (existingPermission && (existingPermission.allow.has(PermissionFlagsBits.ViewChannel) || existingPermission.allow.has(PermissionFlagsBits.SendMessages))) {
                    await existingPermission.delete();
                    await interaction.editReply({
                        content: `La dérogation pour le membre ${targetMember} a été révoquée du ticket ${targetTicket}.`,
                    });
                    await targetMember.send(`Hey ${targetMember}, la dérogation pour le ticket ${targetTicket} vous a été retirée.`);

                    // Log the revoke action using an embed
                    const embed = new EmbedBuilder()
                        .setColor("#FF0000")
                        .setTitle("Dérogation Révoquée")
                        .setDescription(`La dérogation de ${targetMember} pour le ticket ${targetTicket.name} a été révoquée.`)
                        .addFields(
                            { name: "Membre", value: `${targetMember}`, inline: true },
                            { name: "Ticket", value: `${targetTicket.name}`, inline: true },
                            { name: "Lien du Ticket", value: `[Cliquez ici](${channelUrl})`, inline: false },
                            { name: "Révoquée par", value: `${interaction.user}`, inline: true } // Ajouter l'utilisateur ayant exécuté la commande
                        )
                        .setTimestamp();

                    // Envoyer l'embed dans le salon de log des révocations
                    const logChannel = interaction.client.channels.cache.get(revokeLogChannelId);
                    if (logChannel) {
                        await logChannel.send({ embeds: [embed] });
                    } else {
                        console.error(`Le salon de log avec l'ID ${revokeLogChannelId} est introuvable.`);
                    }

                } else {
                    await interaction.editReply({
                        content: `Le membre ${targetMember} n'a pas de dérogation sur le ticket ${targetTicket}.`,
                    });
                }
            } else {
                await interaction.editReply({
                    content: `Le salon choisi n'est pas un ticket.`,
                });
            }
        });
    },
};