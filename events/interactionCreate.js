const { Collection, Events, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const {ticketCreationChooser, depotdossier1, depotdossier2, depotplainte1, depotplainte2, demandemortrp, evenement } = require('./ticketInteraction')
const {claimTicket, unclaimTicket, deleteTicketById} = require('./bouttonsInteraction')
const {userIsBotConfirmation, userIsBotCancel} = require("../utils/isUserBotBtn")
const {client} = require("../index")
const {db} = require("./connectDB")
const {sendError} = require('../utils/sendErrorLogs')

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		const guildId = interaction.guild.id
		if (interaction.isChatInputCommand()) {
			const command = client.commands.get(interaction.commandName);
		
			if (!command) return;
		
			try {
				await command.execute(interaction);
			} catch (error) {
				let where = "InteractionCreate ==> Command Execute"
      			await sendError(error, where)
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({
					content: "There was an error while executing this command!",
					ephemeral: true,
					});
				} else {
					await interaction.reply({
					content: "There was an error while executing this command!",
					ephemeral: true,
					});
				}
			}


		}else if (interaction.isButton()) {
			const botBanInteraction = interaction.customId.split('_');
			const btnCustomId = interaction.customId

			if (interaction.customId === "claimticket"){
				const ticketCreatorId = interaction.user.id;
				await claimTicket(interaction)

			}else if (interaction.customId ===  "btnDeleteTicket"){
				await deleteTicketById(interaction)

			}else if(interaction.customId === "btnUnclaim"){
				await unclaimTicket(interaction)
			
			
			}else if(interaction.customId === "dossierLegalOpen" || interaction.customId === "plainteLegalOpen" || interaction.customId === "eventLegalOpen" || interaction.customId === "dossierIllegalOpen" || interaction.customId === "plainteIllegalOpen" || interaction.customId === "mortIllegalOpen"){
				const recupQuery = `SELECT * FROM ticketinfos WHERE user = '${interaction.user.id}'`

				await db.query(recupQuery, async(err, data) => {
					if(err){
						let where = "InteractionCreate ==> ticketBtn DB Vérif"
      					await sendError(err, where)
						console.log(err)
					}

					if(data.length > 0) {
						const channelId = data[0].ticketId
						const channelUrl = `https://discord.com/channels/${guildId}/${channelId}`
						await interaction.reply({content: `Vous avez déjà créer un ticket. \nRetrouvez le ici: ${channelUrl}`, ephemeral: true})
					}else if (interaction.customId === "dossierLegalOpen"){
						const ticketCreatorId = interaction.user.id
						console.log("open")
						await depotdossier1(interaction, ticketCreatorId)
		
					}else if(interaction.customId === "plainteLegalOpen"){
						const ticketCreatorId = interaction.user.id
						await depotplainte1(interaction, ticketCreatorId)
		
					}else if(interaction.customId === "eventLegalOpen"){
						const ticketCreatorId = interaction.user.id
						await evenement(interaction, ticketCreatorId)
						
					}else if(interaction.customId === "dossierIllegalOpen"){
						const ticketCreatorId = interaction.user.id
						await depotdossier2(interaction, ticketCreatorId)
					}else if(interaction.customId === "plainteIllegalOpen"){
						const ticketCreatorId = interaction.user.id
						await depotplainte2(interaction, ticketCreatorId)
					}else if(interaction.customId === "mortIllegalOpen"){
						const ticketCreatorId = interaction.user.id
						await demandemortrp(interaction, ticketCreatorId)
					}
				})
			}else if(botBanInteraction[0] === "userisBotBtn"){
				userIsBotConfirmation(interaction, btnCustomId)
			}else if(botBanInteraction[0] === "userisntBotBtn"){
				userIsBotCancel(interaction, btnCustomId)
			}
	

		}else if (interaction.isStringSelectMenu()){
			const selectInteraction = interaction.values[0]
			if(interaction.customId === "valoselect"){
				const ticketCreatorId = interaction.user.id
				await ticketCreationChooser(interaction, ticketCreatorId, selectInteraction)

			}else if( interaction.customId === "select" && selectInteraction === "recrustaff"){

				const recruselect = new ActionRowBuilder().addComponents(
				  new StringSelectMenuBuilder()
				  .setCustomId("recruselect")
				  .setPlaceholder("Veuillez séléctionner votre demande")
				  .addOptions([
					{
					label: "Candidature Staff",
					description: "Ouvrir un ticket pour un recrutement staff",
					value: "recrumodo",
					emoji: { name: "🛡️" },
					},
					{
					label: "Plainte Staff",
					description: "Ouvrir un ticket pour faire une plainte staff",
					value: "plaintestaff",
					emoji: { name: "🚨" },
					},
					{
					label: "Candidature community manager",
					description: "Ouvrir un ticket pour un recrutement community manager",
					value: "recrucom",
					emoji: { name: "✨" },
					},
					{
					label: "Demande de deban",
					description: "Ouvrir un ticket pour une demande de deban",
					value: "demandedeban",
					emoji: { name: "🛑" },
					},
				  ])
				);
				const ticketrecru = new EmbedBuilder()
				  .setTitle(`Pré-Ticket de ${interaction.user.username}.`)
				  .setDescription("Merci de séléctionner le poste souhaité")
				  .setColor("Red");
		  
				interaction.reply({
				  embeds: [ticketrecru],
				  components: [recruselect],
				  ephemeral: true,
				});
			
			}else if (interaction.isStringSelectMenu() && interaction.customId === "select" && selectInteraction === "legal"){

					const legalselect = new ActionRowBuilder().addComponents(
					new StringSelectMenuBuilder()
					.setCustomId("legalselect")
					.setPlaceholder("Veuillez séléctionner votre demande")
					.addOptions([
						{
						label: "Déposer un dossier",
						description:
						"Ouvrir un ticket pour un dépot de dossier",
						value: "depotdossier1",
						emoji: { name: "📂" },
						},
						{
						label: "Déposer une plainte",
						description: "Ouvrir un ticket pour déposer une plainte légal",
						value: "depotplainte1",
						emoji: { name: "👮‍♂️" },
						},
						{
						label: "Création d'un événement",
						description: "Ouvrir un ticket pour demander la création d'un evenement",
						value: "recruvalo",
						emoji: { name: "🎉" },
						},
					])
					);
				
					const ticketlegal = new EmbedBuilder()
						.setTitle(`Pré-Ticket de ${interaction.user.username}.`)
						.setDescription("Merci d'approfondir votre demande'")
						.setColor("Red");
				
					interaction.reply({
					embeds: [ticketlegal],
					components: [legalselect],
					ephemeral: true,
					});

				}else if (interaction.isStringSelectMenu() && interaction.customId === "select" && selectInteraction === "illegal"){

					const illegalselect = new ActionRowBuilder().addComponents(
					new StringSelectMenuBuilder()
					.setCustomId("illegalselect")
					.setPlaceholder("Veuillez séléctionner votre demande")
					.addOptions([
						{
						label: "Déposer un dossier",
						description:
						"Ouvrir un ticket pour un dépot de dossier",
						value: "depotdossier2",
						emoji: { name: "📂" },
						},
						{
						label: "Déposer une plainte",
						description: "Ouvrir un ticket pour déposer une plainte illégal",
						value: "depotplainte2",
						emoji: { name: "👮‍♂️" },
						},
						{
							label: "Demande de mort rp",
							description: "Ouvrir un ticket demande de mort rp",
							value: "demandemortrp",
							emoji: { name: "☠️" },
							},
					])
					);
				
					const ticketillegal = new EmbedBuilder()
						.setTitle(`Pré-Ticket de ${interaction.user.username}.`)
						.setDescription("Merci d'approfondir votre demande'")
						.setColor("Red");
				
					interaction.reply({
					embeds: [ticketillegal],
					components: [illegalselect],
					ephemeral: true,
					});

			}else if(interaction.isStringSelectMenu() && interaction.customId === "select" && selectInteraction === "divers"){
				const diversSelect = new ActionRowBuilder().addComponents( 
					new StringSelectMenuBuilder()
						.setCustomId('diversselect')
						.setPlaceholder('Veuillez séléctionner une option')
						.addOptions([
							{
								label: 'Question',
								description: 'Ouvrir un ticket concernant une question',
								value: 'question',
								emoji: { name: '❓' },
							},
							{
								label: 'Problème/Question Boutique',
								description: 'Ouvrir un ticket pour une demande boutique',
								value: 'boutique',
								emoji: { name: '🛒' },
							},
							{
								label: 'Signaler un problème en jeu',
								description: 'Ouvrir un ticket concernant un problème en jeu',
								value: 'problèmeig',
								emoji: { name: '📩' },
							},
							{
								label: 'Signaler un bug',
								description: 'Ouvrir un ticket pour signaler un bug',
								value: 'signalerbug',
								emoji: { name: '🔫' },
							},
						])
					)

				const ticketdivers = new EmbedBuilder()
					.setTitle(`Pré-Ticket de ${interaction.user.username}.`)
					.setDescription("Merci d'approfondir votre demande'")
					.setColor("Red");
				
				interaction.reply({
					embeds: [ticketdivers],
					components: [diversSelect],
					ephemeral: true,
				});
			} else {
				const recupQuery = `SELECT * FROM ticketinfos WHERE user = '${interaction.user.id}'`

				await db.query(recupQuery, async(err, data) => {
					if(err) {
						let where = "InteractionCreate ==> ticketStringMenu DB Vérif"
      					await sendError(err, where)
						console.log(err)
					}

					if(data.length > 0) {
						const channelId = data[0].ticketId
						const channelUrl = `https://discord.com/channels/${guildId}/${channelId}`
						await interaction.reply({content: `Vous avez déjà créer un ticket. \nRetrouvez le ici: ${channelUrl}`, ephemeral: true})
					}else {
						const ticketCreatorId = interaction.user.id
						await ticketCreationChooser(interaction, ticketCreatorId, selectInteraction)
					}
				})
			}	
		}
	}
}