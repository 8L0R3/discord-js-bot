const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { client } = require("../../index");
const { db } = require('../../events/connectDB');
const { sendError } = require('../../utils/sendErrorLogs');
const { setTimeout } = require('node:timers/promises');
const { banLogChannelId } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banfromall')
        .setDescription('Choisir un membre pour le bannir.')
        .addUserOption(option =>
            option
                .setName('cible')
                .setDescription('Le membre à bannir')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName("raison")
                .setDescription("Raison du bannissement"))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    category: "moderation",
    async execute(interaction) {
        const target = interaction.options.getUser('cible');
        const reason = interaction.options.getString("raison") ?? "Aucune(s) raison(s) spécifiée(s)";
        const results = [];

        const searchEmbed = new EmbedBuilder()
            .setColor("Orange")
            .setTitle("Recherche du membre veuillez patienter:")
            .setDescription(`Bannissement de ${target.tag} en cours...`);

        await interaction.reply({ embeds: [searchEmbed] });

        try {
            const guilds = client.guilds.cache.values();
            for (const guild of guilds) {
                let result = `Serveur: ${guild.name} - `;
                try {
                    // Bannir le membre en utilisant l'ID, qu'il soit dans le serveur ou non
                    await guild.bans.create(target.id, { reason });
                    result += "✅";
                } catch (err) {
                    result += "❌ (Erreur ou Membre non trouvé)";
                    await sendError(err, `BFA ==> ${guild.name} banUser`);
                    console.log(`Erreur lors du bannissement sur ${guild.name}:`, err);
                }
                results.push(result);
                await setTimeout(500);
            }

            searchEmbed.setDescription(results.join('\n'));
            await interaction.editReply({ embeds: [searchEmbed] });

            // Finalisation du bannissement
            const finalEmbed = new EmbedBuilder()
                .setColor("Green")
                .setTitle(`Tâche Terminée`)
                .setDescription(`Le membre ${target.tag} a été banni des serveurs suivants:\n${results.join('\n')}\n\nRaison: ${reason}`);

            // Construction de l'embed de log
            const logEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("Bannissement")
                .setDescription(`Le membre ${target} a été banni pour la raison : ${reason} par ${interaction.user}.`)
                .addFields(
                    { name: "Membre Banni", value: `${target}`, inline: true },
                    { name: "Raison", value: `${reason}`, inline: true },
                    { name: "Banni par", value: `${interaction.user}`, inline: true },
                    { name: "Date", value: `${new Date().toLocaleString()}`, inline: false }
                )
                .setTimestamp();

            // Récupération du salon de logs
            const logChannel = client.channels.cache.get(banLogChannelId);
            if (logChannel) {
                await logChannel.send({ embeds: [logEmbed] });
            } else {
                console.error(`Le salon de log avec l'ID ${banLogChannelId} est introuvable.`);
            }

            // Enregistrement dans la base de données
            const interactionServeur = interaction.guild.id;
            const modifiedReason = reason.replace(/'/g, "''");
            const query = `INSERT INTO bandatacommande (userId, interactionCommandeServeur, reason, date) VALUES ('${target.id}', '${interactionServeur}', '${modifiedReason}', '${Date.now()}')`;

            await db.query(query, async function (err) {
                if (err) {
                    finalEmbed.setColor("Red");
                    finalEmbed.setTitle("Échec de la Tâche");
                    finalEmbed.setDescription("Une erreur est survenue lors de la création des données.");
                    console.log(err);
                    await sendError(err, "BFA ==> data insert");
                }
                await interaction.editReply({ embeds: [finalEmbed] });
            });

        } catch (error) {
            await sendError(error, "BFA ==> Main Execution");
            console.error(error);
            await interaction.followUp('Une erreur est survenue lors de l\'exécution de la commande.');
        }
    },
};
