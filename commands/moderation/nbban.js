const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require("discord.js")
const { client } = require("../../index")
const { db } = require("../../events/connectDB");
const { generalGuildId } = require("../../ressources/tickets-ressources/generalServInfo.json")
const { legalGuildId } = require("../../ressources/tickets-ressources/legalServInfo.json")
const { illegalGuildId } = require("../../ressources/tickets-ressources/illegalServInfo.json")
const { sendError } = require('../../utils/sendErrorLogs');


module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("nbban")
        .setDescription("Donne les infos sur les bannissement globaux")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    category: "moderation",
    async execute(interaction) {

        await interaction.deferReply()
        
        try{

        }catch(err){
            await interaction.editReply("Une erreur est survenue.")
            console.log(err)
        }
        
        const query = `SELECT * FROM bandatacommande WHERE userId `

        await db.query(query, async (err, dataRows, fields) => {
            if (err){
                let where = "InfoBan ==> info ban info"
                await sendError(err, where)
                console.log(err)
            }
            let principalBan = 0
            let legalBan = 0
            let illegalBan = 0
            let lastBanTimeStamp = 0
            let latestBanInfo = null;
            
            if(dataRows.length > 0) {
                
                for (const row of dataRows){
                    const banServId = row.interactionCommandeServeur
                    const banTimeStamp = row.date
                    

                    if (banServId === generalGuildId) {
                        principalBan++;
                    } else if (banServId === legalGuildId) {
                        legalBan++;
                    } else if (banServId === illegalGuildId) {
                        illegalBan++;
                    }

                    if(banTimeStamp > lastBanTimeStamp){
                        lastBanTimeStamp = banTimeStamp
                        if (!latestBanInfo || banTimeStamp > latestBanInfo.date) {
                            latestBanInfo = {
                                userId: client.users.cache.get(row.userId) ? client.users.cache.get(row.userId).tag : row.userId,
                                reason: row.reason,
                                interactionCommandeServeur: client.guilds.cache.get(row.interactionCommandeServeur),
                                date: banTimeStamp
                            };
                        }
                    }
                }
                

                const infonBanEmbed = new EmbedBuilder()
                    .setColor("White")
                    .setTitle(`Nombre de bannissements total: ${dataRows.length}`)
                    .setDescription(`
                        - Nombre de bannissements faits sur ✨ SunLife RP ✨: ${principalBan}
                        \n
                        - Nombre de bannissements faits sur SunLife Légal: ${legalBan}
                        \n
                        - Nombre de bannissements faits sur SunLife Illégal: ${illegalBan}
                        \n
                        **Dernier bannissement:**
                        Membre banni : ${latestBanInfo ? latestBanInfo.userId : 'Aucun'}
                        Raison : ${latestBanInfo ? latestBanInfo.reason : 'Aucune'}
                        Serveur : ${latestBanInfo ? latestBanInfo.interactionCommandeServeur : 'Aucun'}
                        Date : <t:${latestBanInfo ? Math.floor(latestBanInfo.date / 1000) : 'Aucune'}:R>
                    `);


                    

                await interaction.editReply({embeds: [infonBanEmbed]})
            }else{
                interaction.editReply(`Il n'y a rien dans la dataBase.`)
            }
        })

    },
};