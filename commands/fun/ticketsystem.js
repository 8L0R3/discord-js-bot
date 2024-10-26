const { ActionRowBuilder, StringSelectMenuBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRow } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-ticket')
        .setDescription('Panel Ticket')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: "fun",
    async execute(interaction) {
        const guild = interaction.guild;

        const ticketembed = new EmbedBuilder()
            .setColor('#C87022')
            .setTitle(`Contacter l'équipe staff de SunLife`)
            .setDescription(`
                - Veuillez ouvrir le menu déroulant et choisir votre demande.
            `)
            .setImage('https://cdn.discordapp.com/attachments/1078330853177962557/1275085925239488674/SunLife_RP2.gif?ex=66c49bce&is=66c34a4e&hm=9b65b49357ce64b2a5b8943b429c5bb3c33d51d156756a5dbe02f3befafaaf2b&')
            .setThumbnail('https://cdn.discordapp.com/attachments/1078330853177962557/1275086074166775909/logosl2.png?ex=66c49bf2&is=66c34a72&hm=7bd6858d90be53aa20d34b3fe9d82fc1c1ae742ba0004cdb9d18a4f38acb3382&');

        //Serveur Légal
        const depotDossierLegalBtn = new ButtonBuilder()
            .setCustomId("dossierLegalOpen")
            .setLabel("Déposer mon dossier")
            .setStyle(ButtonStyle.Success)

        const plainteLegalBtn = new ButtonBuilder()
            .setCustomId("plainteLegalOpen")
            .setLabel("Déposer une plainte")
            .setStyle(ButtonStyle.Danger)
            
        const eventLegalBtn = new ButtonBuilder()
            .setCustomId("eventLegalOpen")
            .setLabel("Evénement")
            .setStyle(ButtonStyle.Secondary)

        
        //Serveur Illégal 
        const depotDossierIllegalBtn = new ButtonBuilder()
            .setCustomId("dossierIllegalOpen")
            .setLabel("Déposer mon dossier")
            .setStyle(ButtonStyle.Success)

        const plainteIllegalBtn = new ButtonBuilder()
            .setCustomId("plainteIllegalOpen")
            .setLabel("Déposer une plainte")
            .setStyle(ButtonStyle.Danger)
        
        const mortIllegalBtn = new ButtonBuilder()
            .setCustomId("mortIllegalOpen")
            .setLabel("Demande de mort rp")
            .setStyle(ButtonStyle.Danger)
            

        // Bouton ticket serveur principal
        const valoSelect = new StringSelectMenuBuilder()
            .setCustomId('select')
            .setPlaceholder('Veuillez sélectionner une option')
            .addOptions(
                {
                    label: 'Sujet Staff',
                    description: 'Candidature staff, Plainte staff, Candidature com, deban',
                    value: 'recrustaff',
                    emoji: { name: '🎯' },
                },
                {
                    label: 'Légal',
                    description: 'Dépot dossier, Dépot plainte, Evénement',
                    value: 'legal',
                    emoji: { name: '🛡️' },
                },
                {
                    label: 'Illégal',
                    description: 'Dépot dossier, Dépot plainte, Demande de mort RP',
                    value: 'illegal',
                    emoji: { name: '💥' },
                },
                {
                    label: 'Divers',
                    description: "Question, Boutique, Problème IG, signaler bug",
                    value: "divers",
                    emoji: { name: "🗂️" }
                },
                {
                    label:"Annulé",
                    description:"Annulé l'action",
                    value:"anulval",
                    emoji: {name:"❌"}
                },
            );

        let responseSetUp = "";
        let row = []

        if (guild.id === "1259473917219962900") {
            row = new ActionRowBuilder().addComponents(valoSelect)
        } else if (guild.id === "1299062810097090691" /*Illégal*/ ) {
            row = new ActionRowBuilder().addComponents(depotDossierIllegalBtn, plainteIllegalBtn, mortIllegalBtn)
        }else if(guild.id === "1299359706170654844" /*Légal*/){
            row = new ActionRowBuilder().addComponents(depotDossierLegalBtn, plainteLegalBtn, eventLegalBtn)
        }else{
            responseSetUp = "Ceci n'est pas possible ici.";
        }

        await interaction.reply({ content: responseSetUp, embeds: [ticketembed], components: [row] });
    },
};
