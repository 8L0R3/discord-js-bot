const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { generalGuildId, moderation } = require("../../ressources/tickets-ressources/generalServInfo.json");
const { db } = require("../../events/connectDB");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("absence")
        .setDescription("Signalez votre Absence"),
    
    category: "fun",
    async execute(interaction) {
        const interactionMember = interaction.member;
        if (interactionMember.roles.cache.some(role =>
            role.id === moderation
        ) || interactionMember.permissions.has(PermissionFlagsBits.ManageRoles) || interaction.guild.id === generalGuildId) {
            const modal = new ModalBuilder()
                .setTitle("Absence Modérateur")
                .setCustomId(`modalabsjoueur-${interaction.user.id}`);

            const startTime = new TextInputBuilder()
                .setCustomId('startdatetime')
                .setRequired(true)
                .setLabel("Début de l'absence:")
                .setPlaceholder("Au format JJ/MM/AAAA")
                .setMaxLength(10)
                .setMinLength(10)
                .setStyle(TextInputStyle.Short);

            const endtime = new TextInputBuilder()
                .setCustomId('enddatetime')
                .setRequired(true)
                .setLabel("Fin de l'absence:")
                .setPlaceholder("Au format JJ/MM/AAAA")
                .setMaxLength(10)
                .setMinLength(10)
                .setStyle(TextInputStyle.Short);

            const reason = new TextInputBuilder()
                .setCustomId('reasonjoueur')
                .setRequired(true)
                .setLabel("Veuillez écrire la raison")
                .setPlaceholder("non obligatoire")
                .setMaxLength(2000)
                .setStyle(TextInputStyle.Paragraph);

            const firstActionRow = new ActionRowBuilder().addComponents(startTime);
            const secondActionRow = new ActionRowBuilder().addComponents(endtime);
            const thirdActionRow = new ActionRowBuilder().addComponents(reason);

            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
            await interaction.showModal(modal);

            const filter = (modalInteraction) => modalInteraction.customId === `modalabsjoueur-${interaction.user.id}`;

            interaction.awaitModalSubmit({ filter, time: 70000 }).then(async (modalInteraction) => {
                const startValue = modalInteraction.fields.getTextInputValue("startdatetime");
                const endValue = modalInteraction.fields.getTextInputValue("enddatetime");
                const reasonValue = modalInteraction.fields.getTextInputValue("reasonjoueur");

                // Convertir les valeurs de date en objets Date
                const startDateParts = startValue.split("/");
                const endDateParts = endValue.split("/");

                const currentDate = new Date();

                const yesterday = new Date(currentDate);
                yesterday.setDate(currentDate.getDate() - 1);

                // Créer des objets Date en utilisant le format JJ/MM/AAAA
                const startDate = new Date(`${startDateParts[2]}-${startDateParts[1]}-${startDateParts[0]}`);
                const endDate = new Date(`${endDateParts[2]}-${endDateParts[1]}-${endDateParts[0]}`);

                // Vérifier si la enddate est antérieure à la startdate
                if (endDate < startDate) {
                    await modalInteraction.reply({
                        content: "La date de fin ne peut pas être antérieure à la date de début.",
                        ephemeral: true,
                    });
                    return;
                } else if (startDate < yesterday || endDate < yesterday) {
                    await modalInteraction.reply({
                        content: "La date de début et de fin doit être postérieure à la date actuelle moins un jour.",
                        ephemeral: true,
                    });
                    return;
                } else {
                    await modalInteraction.reply({
                        content: "Votre absence a été postée",
                        ephemeral: true,
                    });
                    const tag1 = modalInteraction.user.tag;

                    let targetChannel1 = "";
                    const embed26 = new EmbedBuilder()
                        .setAuthor({ name: `Absence de ${tag1}`, iconURL: modalInteraction.user.displayAvatarURL() })
                        .setTitle("Consulter votre absence ici")
                        .setThumbnail("https://cdn.discordapp.com/attachments/1078330853177962557/1260362103898771529/SL.png?ex=668f0b2d&is=668db9ad&hm=7b138c537ac5122479af6a5250f1b9da54358f9d95a94b2bdc20108d416b6707&")
                        .setDescription(`**Date d'Absence**  \nDu ${startValue} au ${endValue}`)
                        .addFields({ name: "**Raison**", value: `${reasonValue}` })
                        .setColor("#C87022");

                    let absenceCategory = "";

                    if (modalInteraction.guild.id === generalGuildId) {
                        targetChannel1 = modalInteraction.client.channels.cache.get("1260396598622425149");
                        absenceCategory = "moderation";
                    }
                    targetChannel1.send({ embeds: [embed26] });

                    // Entrée des données dans la database
                    const serverNameOfTheUser = modalInteraction.user.globalName;
                    const userId = modalInteraction.user.id;
                    const modifiedReasonValue = reasonValue.replace(/'/g, "''");

                    const query = `INSERT INTO testabsence (userId, usertag, useravatar, startdate, enddate, raison, category, date) VALUES 
                    ('${userId}', '${serverNameOfTheUser}', 
                    '${modalInteraction.user.displayAvatarURL()}', '${startValue}', '${endValue}', '${modifiedReasonValue}', '${absenceCategory}', '${Date.now()}')`;

                    try {
                        db.query(query, async function(err) {
                            if (err) throw err;
                        });
                    } catch (error) {
                        console.log(`Une erreur est survenue lors de la création des données pour l'absence de ${serverNameOfTheUser} \nErreur: ${error}`);
                    }
                }
            }).catch((error) => {
                console.log(`Erreur lors de la soumission du modal: ${error}`);
            });
        } else {
            interaction.reply({ content: "Vous n'avez pas la permission d'exécuter cette commande.", ephemeral: true });
        }
    }
};