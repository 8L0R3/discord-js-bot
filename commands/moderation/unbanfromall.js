const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { db } = require("../../events/connectDB");
const { client } = require("../../index");
const wait = require('node:timers/promises').setTimeout;
const { sendError } = require('../../utils/sendErrorLogs');
const { unbanLogChannelId } = require('../../config.json');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('unbanfromall')
        .setDescription('Choisir un membre à unban.')
        .addUserOption(option =>
            option
                .setName('cible')
                .setDescription(`L'id du membre à unban`)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    category: "moderation",
    async execute(interaction) {
        const target = interaction.options.getUser('cible');
        const userId = target.id;
        
        await interaction.deferReply();

        try {
            db.query(`SELECT * FROM bandatacommande WHERE userId = '${userId}'`, async (err, req) => {
                if (err) {
                    let where = "uBFA ==> data search";
                    await sendError(err, where);
                    console.log(err);
                    return;
                }

                if (req.length > 0) {
                    try {
                        let unbanResults = [];

                        const searchUnbanEmbed = new EmbedBuilder()
                            .setColor("Orange")
                            .setTitle(`Unban de ${target.tag} des serveurs en cours...`);

                        await interaction.editReply({
                            embeds: [searchUnbanEmbed]
                        });

                        const guilds = client.guilds.cache.values();
                        for (const guild of guilds) {
                            try {
                                const bannedUser = await guild.bans.fetch(userId).catch(() => null);
                                if (bannedUser) {
                                    await guild.members.unban(userId);
                                    unbanResults.push({ guild: guild.name, result: "✅" });
                                } else {
                                    unbanResults.push({ guild: guild.name, result: "❌ Non trouvé" });
                                }
                            } catch (err) {
                                unbanResults.push({ guild: guild.name, result: "❌ Erreur" });
                                await sendError(err, `uBFA ==> ${guild.name}`);
                            }
                        }

                        const resultString = unbanResults.map(res => `${res.guild}: ${res.result}`).join("\n");

                        searchUnbanEmbed.setColor("Green")
                            .setTitle(`Unban terminé`)
                            .setDescription(resultString);
                        
                        await interaction.editReply({
                            embeds: [searchUnbanEmbed]
                        });

                        // Log l'action de ban
                        const embed = new EmbedBuilder()
                            .setColor("#00FF00")
                            .setTitle("Unbannissement")
                            .setDescription(`Le membre ${target} a été unban par ${interaction.user}.`)
                            .addFields(
                                { name: "Membre Unbanni", value: `${target}`, inline: true },
                                { name: "Unbanni par", value: `${interaction.user}`, inline: true },
                                { name: "Date", value: `${new Date().toLocaleString()}`, inline: false }
                            )
                            .setTimestamp();

                        const logChannel = client.channels.cache.get(unbanLogChannelId);
                        if (logChannel) {
                            await logChannel.send({ embeds: [embed] });
                        } else {
                            console.error(`Le salon de log avec l'ID ${unbanLogChannelId} est introuvable.`);
                        }

                        // Suppression des données de ban de la base de données
                        const query = `DELETE FROM bandatacommande WHERE userId = '${userId}'`;
                        await db.query(query, async function (err) {
                            if (err) {
                                await wait(500);
                                await interaction.followUp({ content: "Une erreur est survenue lors de la suppression des données de ban de la base de données.", ephemeral: true });
                                console.error(err);
                                let where = "uBFA ==> DataDelete";
                                await sendError(err, where);
                            } else {
                                await wait(500);
                                await interaction.followUp({ content: "Le membre a été unban avec succès.", ephemeral: true });
                            }
                        });
                    } catch (dbError) {
                        let err = dbError;
                        let where = "uBFA ==> DataDelete";
                        await sendError(err, where);
                        console.log(`Erreur lors de la suppression des données dans la DB \n${dbError}`);
                        await interaction.editReply({ content: `Veuillez nous excuser, il y a eu une erreur lors de l'unban du membre.`, ephemeral: true });
                    }
                } else {
                    await interaction.editReply(`Le membre n'est pas dans la base de données.`);
                }
            });
        } catch (err) {
            await interaction.editReply({ content: `Veuillez nous excuser, il y a eu une erreur lors de l'unban du membre.`, ephemeral: true });
            console.log(err);
            let where = "uBFA ==> Général";
            await sendError(err, where);
        }
    },
};
