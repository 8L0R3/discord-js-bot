const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require("discord.js")
const {db} = require("../../events/connectDB");
const { time } = require("console");
const { client } = require("../../index");
const {sendError} = require('../../utils/sendErrorLogs')

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("infoban")
        .setDescription("Donne les infos sur le bannissement d'un membre")
        .addUserOption(option =>
            option
                .setName('membre')
                .setDescription('Le membre dont le ban est chercher')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    category: "moderation",
    async execute(interaction) {
        const member = interaction.options.getUser('membre')

        await interaction.deferReply()
        
        const memberId = member.id
        const query = `SELECT * FROM bandatacommande WHERE userId = '${memberId}' `

        await db.query(query, async (err, dataRows, fields) => {
            if (err){
                let where = "InfoBan ==> info ban search"
                await sendError(err, where)
                console.log(err)
            }
            
            if(dataRows.length > 0) {
                const userBanId = dataRows[0].userId
                const guildBanId = dataRows[0].interactionCommandeServeur
                const reason = dataRows[0].reason
                const timestamp = dataRows[0].date

                const banDate = new Date(Number(timestamp))
                const memberTransform = await interaction.guild.members.fetch(userBanId).catch(() => null);
                let memberTag;

                if (!memberTransform) {
                    // Si le membre n'est pas trouvé, utiliser le nom de l'utilisateur de la commande
                    memberTag = member.tag;
                } else {
                    // Utiliser le tag de l'utilisateur trouvé dans le serveur
                    memberTag = memberTransform.user.tag;
                }

                //Guild Ban origin
                let guildBanOrigin
                if (guildBanId === "1259473917219962900"){ //principal
                    guildBanOrigin ="✨ SunLife RP ✨"
                }else if (guildBanId === "1299359706170654844"){//legal
                    guildBanOrigin = "SunLife Légal"
                }else if (guildBanId === "1299062810097090691"){//illegal
                    guildBanOrigin = "SunLife Illégal"
                }
                

                const infonBanEmbed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle(`Infos sur le bannissement de ${memberTag}:`)
                    .setDescription(`Raison du bannissement: \n${reason}`)
                    .addFields(
                        { name: 'Commande de ban executer sur le serveur', value: guildBanOrigin, inline: true },
                        { name: 'Date du bannissement', value: banDate.toLocaleString(), inline: true }
                    )

                await interaction.editReply({embeds: [infonBanEmbed]})
            }else{
                interaction.editReply(`Le membre n'est pas dans la dataBase.`)
            }
        })

    },
};
