const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { db } = require("../../events/connectDB");
const { sendError } = require("../../utils/sendErrorLogs");
const { derogLogChannelId } = require('../../config.json');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("derog")
        .setDescription("Permet de donner une dérogation à un ticket pour membre")
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("Le membre à qui donner la dérogation.")
                .setRequired(true))
        .addChannelOption(option =>
            option
                .setName("ticket")
                .setDescription("Le ticket ciblé")
                .setRequired(true))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: "utility",
    async execute(interaction) {
        const targetMember = interaction.options.getUser("member");
        const targetTicket = interaction.options.getChannel("ticket");

        const récupQuery = `SELECT * FROM ticketinfos WHERE ticketId = '${targetTicket.id}'`;

        await db.query(récupQuery, async (err, data) => {
            if (err) {
                let where = "derog ==> récup";
                await sendError(where, err);
                console.log("Une erreur est survenue lors de la récupération des données", err);
                return;
            }

            if (data.length > 0) {
                const channelId = data[0].ticketId;
                const guildId = data[0].guildId;
                const channelUrl = `https://discord.com/channels/${guildId}/${channelId}`;
                
                await targetTicket.permissionOverwrites.create(targetMember, {
                    ViewChannel: true
                });

                await interaction.reply({ content: `Une dérogation a été créée pour le membre ${targetMember}.\nIl a maintenant accès au ticket ${targetTicket}`, ephemeral: true });
                await targetMember.send(`Hey ${targetMember}, une dérogation a été créée pour vous. Vous avez maintenant accès à ${targetTicket}`);

                // Log the derog action using an embed
                const embed = new EmbedBuilder()
                    .setColor("#00FF00")
                    .setTitle("Dérogation Accordée")
                    .setDescription(`Une dérogation a été accordée à ${targetMember} pour accéder au ticket ${targetTicket.name}.`)
                    .addFields(
                        { name: "Membre", value: `${targetMember}`, inline: true },
                        { name: "Ticket", value: `${targetTicket.name}`, inline: true },
                        { name: "Lien du Ticket", value: `[Cliquez ici](${channelUrl})`, inline: false },
                        { name: "Accordé par", value: `${interaction.user}`, inline: true } // Ajouter l'utilisateur ayant exécuté la commande
                    )
                    .setTimestamp();

                // Envoyer l'embed dans le salon de log des dérogations
                const logChannel = interaction.client.channels.cache.get(derogLogChannelId);
                if (logChannel) {
                    await logChannel.send({ embeds: [embed] });
                } else {
                    console.error(`Le salon de log avec l'ID ${derogLogChannelId} est introuvable.`);
                }
            } else {
                await interaction.reply({ content: `Le salon choisi n'est pas un ticket.`, ephemeral: true });
            }
        });
    },
};
