const {EmbedBuilder, ChannelType,ActionRowBuilder,ButtonBuilder,PermissionFlagsBits,ButtonStyle} = require("discord.js");
const { claimButon, buttondelete } = require("../ressources/bouttons")
const {} = require("./bouttonsInteraction")
const {db} = require('./connectDB')
const{client} = require('../index')
//IDs serv principal
const { log, timeLog } = require("console");
const { data } = require("../commands/fun/ticketsystem");
const wait = require('node:timers/promises').setTimeout;
const {sendError} = require('../utils/sendErrorLogs')

let discriminant = ""

//----------------------------------Serv Principal-----------------------------------------

    //---------------------------------------MODERATION--------------------------------
    async function recruModo(interaction, ticketCreatorId) {
      try {
        const everyone = interaction.guild.roles.cache.find(
          (r) => r.name === "@everyone"
        );
        interaction.guild.channels
          .create({
            name: `🛡️・ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: "1299068995944710206", // Id Catégorie ticket
            permissionOverwrites: [
              {
                id: "1299067621383077908", // Rôle Fonda
                allow: PermissionFlagsBits.ViewChannel,
              },
              {
                id: "1299067622532583516", // Rôle Co-Fonda
                allow: PermissionFlagsBits.ViewChannel,
              },
              {
                id: ticketCreatorId, // Rôle Demandeur du ticket
                allow: PermissionFlagsBits.ViewChannel,
              },
              {
                id: everyone.id, // Rôles Everyone
                deny: PermissionFlagsBits.ViewChannel,
              },
            ],
          })
          .then((c) => {
            const tembedmodo = new EmbedBuilder()
              .setTitle(`Ticket de ${interaction.user.username}.`)
              .setDescription(
                "Veuillez remplir le formulaire en cliquant sur le bouton formulaire"
              )
              .setColor("Green");
    
            const bembedmodo = new ButtonBuilder()
              .setLabel("Formulaire Candidature Staff")
              .setURL(
                "https://docs.google.com/forms/d/e/1FAIpQLSf-gwy0cFG4-WlO7wJZgi9urSRNnGQN0avUFDsmlIpEsJUhiw/viewform?usp=pp_url"
              )
              .setStyle(ButtonStyle.Link);
    
            const rowbembedmodo = new ActionRowBuilder().addComponents(
              bembedmodo,
              claimButon
            );
            
            const discriminant = "🛡️";
            const channelCategory = "modo";
            const targetGuild = interaction.guild;
            
            c.send({ embeds: [tembedmodo], components: [rowbembedmodo] });
            
            ticketDataCreation(interaction, ticketCreatorId, discriminant, c, targetGuild, channelCategory);
          });
      } catch (error) {
        console.log(`Erreur avec recruModo: ${error}`);
      }
    }
    
async function plaintestaff(interaction, ticketCreatorId){
      try{
        const everyone = interaction.guild.roles.cache.find(
          (r) => r.name === "@everyone"
        );
        interaction.guild.channels
          .create({
            name: `🚨・ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: "1299068999954464940", // Id Catégorie ticket
            permissionOverwrites: [
              {
                id: "1299067621383077908", // Rôle Fonda
                allow: PermissionFlagsBits.ViewChannel,
              },
              {
                id: "1299067622532583516", // Rôle Co-Fonda
                allow: PermissionFlagsBits.ViewChannel,
              },
              {
                id: ticketCreatorId, // Rôle Demandeur du ticket
                allow: PermissionFlagsBits.ViewChannel,
              },
              {
                id: everyone.id, // Rôles Everyone
                deny: PermissionFlagsBits.ViewChannel,
              },
            ],
          })
          .then((c) => {
            const tembedplaintestaff = new EmbedBuilder()
              .setTitle(`Ticket de ${interaction.user.username}.`)
              .setDescription(
                "Veuillez remplir le formulaire en cliquant sur le bouton formulaire"
              )
              .setColor("Green");
      
            const rowbembedplaintestaff = new ActionRowBuilder().addComponents(
              claimButon
            );
            discriminant = "🚨"
            channelCategory = "plaintestaff"
            targetGuild = interaction.guild
            c.send({ embeds: [tembedplaintestaff], components: [rowbembedplaintestaff] });
            ticketDataCreation(interaction, ticketCreatorId, discriminant, c, targetGuild, channelCategory)
          });
      }catch(error){
        console.log(`Erreur avec plaintestaff: ${error}`)
      }
}
    
async function recrucom(interaction, ticketCreatorId){
      try{
        const everyone = interaction.guild.roles.cache.find(
          (r) => r.name === "@everyone"
        );
        interaction.guild.channels
          .create({
            name: `🎬・ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: "1299068998771671213", // Id Catégorie ticket
            permissionOverwrites: [
              {
                id: "1299067621383077908", // Rôle Fonda
                allow: PermissionFlagsBits.ViewChannel,
              },
              {
                id: "1299067622532583516", // Rôle Co-Fonda
                allow: PermissionFlagsBits.ViewChannel,
              },
              {
                id: ticketCreatorId, // Rôle Demandeur du ticket
                allow: PermissionFlagsBits.ViewChannel,
              },
              {
                id: everyone.id, // Rôles Everyone
                deny: PermissionFlagsBits.ViewChannel,
              },
            ],
          })
          .then((c) => {
            const tembedcom = new EmbedBuilder()
              .setTitle(`Ticket de ${interaction.user.username}.`)
              .setDescription(
                "Veuillez remplir le formulaire en cliquant sur le bouton formulaire"
              )
              .setColor("Green");
      
            /*{const bembedcom = new ButtonBuilder()
              .setLabel("Formulaire Audio Visuel")
              .setURL(
                "https://docs.google.com/forms/d/e/1FAIpQLSeGzDf-R4AK7nUT1yZJgMobCWP3ybLUo_k7kDKp6PFvH3ytUA/viewform?usp=pp_url"
              )
              .setStyle(ButtonStyle.Link);},*/
      
            
            const rowbembedcom = new ActionRowBuilder().addComponents(
              /*{bembedcom,},*/
              claimButon,
            );
            discriminant = "🎬"
            channelCategory = "com"
            targetGuild = interaction.guild
            c.send({ embeds: [tembedcom], components: [rowbembedcom] });
            ticketDataCreation(interaction, ticketCreatorId, discriminant, c, targetGuild, channelCategory)
          });
      }catch(error){
        console.log(`Ereur avec recrucom: ${error}`)
      }
}

async function demandedeban(interaction, ticketCreatorId){
  try{
    const everyone = interaction.guild.roles.cache.find(
      (r) => r.name === "@everyone"
    );
    interaction.guild.channels
      .create({
        name: `🛑・ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: "1299069001120485417", // Id Catégorie ticket
        permissionOverwrites: [
          {
            id: "1299067621383077908", // Rôle Fonda
            allow: PermissionFlagsBits.ViewChannel,
          },
          {
            id: "1299067622532583516", // Rôle Co-Fonda
            allow: PermissionFlagsBits.ViewChannel,
          },
          {
            id: "1299068940689080341", // Rôle Staff
            allow: PermissionFlagsBits.ViewChannel,
          },
          {
            id: ticketCreatorId, // Rôle Demandeur du ticket
            allow: PermissionFlagsBits.ViewChannel,
          },
          {
            id: everyone.id, // Rôles Everyone
            deny: PermissionFlagsBits.ViewChannel,
          },
        ],
      })
      .then((c) => {
        const tembeddemandedeban = new EmbedBuilder()
          .setTitle(`Ticket de ${interaction.user.username}.`)
          .setDescription(
            "Veuillez remplir le formulaire en cliquant sur le bouton formulaire"
          )
          .setColor("Green");
  
        const rowbembeddemandedeban = new ActionRowBuilder().addComponents(
          claimButon,
        );
        discriminant = "🛑"
        channelCategory = "demandedeban"
        targetGuild = interaction.guild
        c.send({ embeds: [tembeddemandedeban], components: [rowbembeddemandedeban] });
        ticketDataCreation(interaction, ticketCreatorId, discriminant, c, targetGuild, channelCategory)
      });
  }catch(error){
    console.log(`Ereur avec demandedeban: ${error}`)
  }
}

    //-------------------------------------LEGAL------------------------------------

async function depotdossier1(interaction, ticketCreatorId){
  try{
    const mainGuild = client.guilds.cache.get("1259473917219962900")
    const everyone = mainGuild.roles.cache.find(
      (r) => r.name === "@everyone"
    );
    mainGuild.channels
      .create({
        name: `📁・ticket-${interaction.user.username} `,
        type: ChannelType.GuildText,
        parent: "1299069003989520447", // Id Catégorie ticket
        permissionOverwrites: [
          {
            id: "1299068928861143083", // Role Gérant Légal
            allow: PermissionFlagsBits.ViewChannel,
          },
          {
            id: "1299068940689080341", // Role Staff
            allow: PermissionFlagsBits.ViewChannel,
          },
          {
            id: ticketCreatorId, // Demandeur du ticket
            allow: PermissionFlagsBits.ViewChannel,
          },
          {
            id: everyone, // Everyone
            deny: PermissionFlagsBits.ViewChannel,
          },
        ],
      })
      .then((c) => {
        const ticketdepotdossier1 = new EmbedBuilder()
          .setTitle(`Ticket de ${interaction.user.username}.`)
          .setDescription(
            "Le support sera avec vous sous peu. \n Pour clôturer ce ticket réagissez avec 🔒"
          )
          .setColor("Green");

        const rowclaimclosedepotdossier1 = new ActionRowBuilder().addComponents(
          claimButon
        );
        discriminant = "📁" 
        channelCategory = "depotdossier1"
        targetGuild = interaction.guild
        c.send({
          embeds: [ticketdepotdossier1],
          components: [rowclaimclosedepotdossier1],
        });
        ticketDataCreation(interaction, ticketCreatorId, discriminant, c, targetGuild, channelCategory)
      });
  }catch(err){
    console.log(err)
  }
      
      
}

async function depotplainte1(interaction, ticketCreatorId){
  
      const mainGuild = client.guilds.cache.get("1259473917219962900")
      const everyone = mainGuild.roles.cache.find(
        (r) => r.name === "@everyone"
      );
      mainGuild.channels
        .create({
          name: `🚨・ticket-${interaction.user.username} `,
          type: ChannelType.GuildText,
          parent: "1299069004887101471", // Id Catégorie ticket
          permissionOverwrites: [
            {
              id: "1299068928861143083", // Role Gérant Légal
              allow: PermissionFlagsBits.ViewChannel,
            },
            {
              id: "1299068940689080341", // Role Staff
              allow: PermissionFlagsBits.ViewChannel,
            },
            {
              id: ticketCreatorId, // Demandeur du ticket
              allow: PermissionFlagsBits.ViewChannel,
            },
            {
              id: everyone.id, // Everyone
              deny: PermissionFlagsBits.ViewChannel,
            },
          ],
        })
        .then((c) => {
          const ticketdepotplainte1 = new EmbedBuilder()
            .setTitle(`Ticket de ${interaction.user.username}.`)
            .setDescription(
              "Le support sera avec vous sous peu. \n Pour clôturer ce ticket réagissez avec 🔒"
            )
            .setColor("Green");

          const rowclaimclosedepotplainte1 = new ActionRowBuilder().addComponents(
            claimButon
          );
          discriminant = "🚨"
          channelCategory = "depotplainte1"
          c.send({embeds: [ticketdepotplainte1],components: [rowclaimclosedepotplainte1],});
          targetGuild = interaction.guild
          ticketDataCreation(interaction, ticketCreatorId, discriminant, c, targetGuild, channelCategory)
        });
      
}

async function evenement(interaction, ticketCreatorId){

  const mainGuild = client.guilds.cache.get("1259473917219962900")
      const everyone = mainGuild.roles.cache.find(
        (r) => r.name === "@everyone"
      );
      mainGuild.channels
        .create({
          name: `🎉・ticket-${interaction.user.username} `,
          type: ChannelType.GuildText,
          parent: "1299069006258372720", // Id Catégorie ticket
          permissionOverwrites: [
            {
             id: "1299068928861143083", // Role Gérant Légal
             allow: PermissionFlagsBits.ViewChannel,
            },
            {
             id: "1299068940689080341", // Role Staff
             allow: PermissionFlagsBits.ViewChannel,
            },
            {
              id: "1299068932614783016", // Role Gérant Illégal
             allow: PermissionFlagsBits.ViewChannel,
            },
            {
              id: ticketCreatorId, // Demandeur du ticket
              allow: PermissionFlagsBits.ViewChannel,
            },
            {
              id: everyone.id, // Everyone
              deny: PermissionFlagsBits.ViewChannel,
            },
          ],
        })
        .then((c) => {
          const ticketevenement = new EmbedBuilder()
            .setTitle(`Ticket de ${interaction.user.username}.`)
            .setDescription(
              "Le support sera avec vous sous peu. \n Pour clôturer ce ticket réagissez avec 🔒"
            )
            .setColor("Green");

          const rowclaimcloseevenement = new ActionRowBuilder().addComponents(
            claimButon
          );
          discriminant = "🎉"
          channelCategory = "evenement"
          targetGuild = interaction.guild
          c.send({ embeds: [ticketevenement], components: [rowclaimcloseevenement] });
          ticketDataCreation(interaction, ticketCreatorId, discriminant, c, targetGuild, channelCategory)
        });
        
      
}

    //-------------------------------------Illégal------------------------------------

async function depotdossier2(interaction, ticketCreatorId){
  const mainGuild = client.guilds.cache.get("1259473917219962900")
  const everyone = mainGuild.roles.cache.find(
    (r) => r.name === "@everyone"
  );
  mainGuild.channels
    .create({
      name: `📂・ticket-${interaction.user.username} `,
      type: ChannelType.GuildText,
      parent: "1299069008900915261", // Id Catégorie ticket
      permissionOverwrites: [
        {
          id: "1299068940689080341", // Role Staff
          allow: PermissionFlagsBits.ViewChannel,
         },
         {
           id: "1299068932614783016", // Role Gérant Illégal
          allow: PermissionFlagsBits.ViewChannel,
         },
        {
          id: ticketCreatorId, // Demandeur du ticket
          allow: PermissionFlagsBits.ViewChannel,
        },
        {
          id: everyone.id, // Everyone
          deny: PermissionFlagsBits.ViewChannel,
        },
      ],
    })
    .then((c) => {
      const ticketdepotdossier2 = new EmbedBuilder()
        .setTitle(`Ticket de ${interaction.user.username}.`)
        .setDescription(
          "Le support sera avec vous sous peu. \n Pour clôturer ce ticket réagissez avec 🔒"
        )
        .setColor("Green");

      const rowclaimclosedepotdossier2 = new ActionRowBuilder().addComponents(
        claimButon
      );
      discriminant = "📂" 
      channelCategory = "depotdossier2"
      targetGuild = interaction.guild
      c.send({
        embeds: [ticketdepotdossier2],
        components: [rowclaimclosedepotdossier2],
      });
      ticketDataCreation(interaction, ticketCreatorId, discriminant, c, targetGuild, channelCategory)
    });
  
}

async function depotplainte2(interaction, ticketCreatorId){

  const mainGuild = client.guilds.cache.get("1259473917219962900")
  const everyone = mainGuild.roles.cache.find(
    (r) => r.name === "@everyone"
  );
  mainGuild.channels
    .create({
      name: `🚨・ticket-${interaction.user.username} `,
      type: ChannelType.GuildText,
      parent: "1299069009777393767", // Id Catégorie ticket
      permissionOverwrites: [
        {
          id: "1299068940689080341", // Role Staff
          allow: PermissionFlagsBits.ViewChannel,
         },
         {
           id: "1299068932614783016", // Role Gérant Illégal
          allow: PermissionFlagsBits.ViewChannel,
         },
        {
          id: ticketCreatorId, // Demandeur du ticket
          allow: PermissionFlagsBits.ViewChannel,
        },
        {
          id: everyone.id, // Everyone
          deny: PermissionFlagsBits.ViewChannel,
        },
      ],
    })
    .then((c) => {
      const ticketdepotplainte2 = new EmbedBuilder()
        .setTitle(`Ticket de ${interaction.user.username}.`)
        .setDescription(
          "Le support sera avec vous sous peu. \n Pour clôturer ce ticket réagissez avec 🔒"
        )
        .setColor("Green");

      const rowclaimclosedepotplainte2 = new ActionRowBuilder().addComponents(
        claimButon
      );
      discriminant = "🚨"
      channelCategory = "depotplainte2"
      targetGuild = interaction.guild
      c.send({
        embeds: [ticketdepotplainte2],
        components: [rowclaimclosedepotplainte2],
      });
      ticketDataCreation(interaction, ticketCreatorId, discriminant, c, targetGuild, channelCategory)
    });
  
}

async function demandemortrp(interaction, ticketCreatorId){

  const mainGuild = client.guilds.cache.get("1259473917219962900")
  const everyone = mainGuild.roles.cache.find(
    (r) => r.name === "@everyone"
  );
  mainGuild.channels
    .create({
      name: `💀・ticket-${interaction.user.username} `,
      type: ChannelType.GuildText,
      parent: "1299069011174101072", // Id Catégorie ticket
      permissionOverwrites: [
        {
          id: "1299068940689080341", // Role Staff
          allow: PermissionFlagsBits.ViewChannel,
         },
         {
           id: "1299068932614783016", // Role Gérant Illégal
          allow: PermissionFlagsBits.ViewChannel,
         },
        {
          id: ticketCreatorId, // Demandeur du ticket
          allow: PermissionFlagsBits.ViewChannel,
        },
        {
          id: everyone.id, // Everyone
          deny: PermissionFlagsBits.ViewChannel,
        },
      ],
    })
    .then((c) => {
      const ticketdemandemortrp = new EmbedBuilder()
        .setTitle(`Ticket de ${interaction.user.username}.`)
        .setDescription(
          "Le support sera avec vous sous peu. \n Pour clôturer ce ticket réagissez avec 🔒"
        )
        .setColor("Green");

      const rowclaimclosedemandemortrp = new ActionRowBuilder().addComponents(
        claimButon
      );
      discriminant = "💀"
      channelCategory = "demandemortrp"
      targetGuild = interaction.guild
      c.send({
        embeds: [ticketdemandemortrp],
        components: [rowclaimclosedemandemortrp],
      });
      ticketDataCreation(interaction, ticketCreatorId, discriminant, c, targetGuild, channelCategory)
    });
  
}

    //-------------------------------------AUTRE------------------------------------
    async function question(interaction, ticketCreatorId) {
      try {
        const everyone = interaction.guild.roles.cache.find(
          (r) => r.name === "@everyone"
        );
        interaction.guild.channels
          .create({
          name: `❓️❗️・ticket-${interaction.user.username}`,
          type: ChannelType.GuildText,
          parent: "1299069013829095536", // Category ID for tickets
          permissionOverwrites: [
            {
              id: "1299067621383077908", // Fonda role
              allow: PermissionFlagsBits.ViewChannel,
            },
            {
              id: "1299067622532583516", // Co-Fonda role
              allow: PermissionFlagsBits.ViewChannel,
            },
            {
              id: "1299068940689080341", // Staff role
              allow: PermissionFlagsBits.ViewChannel,
            },
            {
              id: ticketCreatorId, // Ticket creator
              allow: PermissionFlagsBits.ViewChannel,
            },
            {
              id: everyone.id, // Everyone
              deny: PermissionFlagsBits.ViewChannel,
            },
          ],
        })  
        .then((c) => {
        const ticketQuestion = new EmbedBuilder()
          .setTitle(`Ticket de ${interaction.user.username}.`)
          .setDescription("Le support sera avec vous sous peu. \n Pour clôturer ce ticket réagissez avec 🔒")
          .setColor("Green");
    
        const rowbembedquestion = new ActionRowBuilder().addComponents(
          claimButon
        );

        const discriminant = "❓️❗️";
        const channelCategory = "question";
        const targetGuild = interaction.guild;
        
        c.send({ embeds: [ticketQuestion], components: [rowbembedquestion] });

        ticketDataCreation(interaction, ticketCreatorId, discriminant, c, targetGuild, channelCategory);
        });
      } catch (error) {
        console.error('Error creating ticket channel:', error);
        // Handle the error appropriately, e.g., send a message back to the user
      }
    }    

async function boutique(interaction, ticketCreatorId){
  try {
    const everyone = interaction.guild.roles.cache.find(
      (r) => r.name === "@everyone"
    );
    interaction.guild.channels
          .create({
            name: `🛒・ticket-${interaction.user.username} `,
            type: ChannelType.GuildText,
            parent: "1299069015469195334", // Id Catégorie ticket
            permissionOverwrites: [
              {
                id: "1299067621383077908", // Rôle Fonda
                allow: PermissionFlagsBits.ViewChannel,
              },
              {
                id: "1299067622532583516", // Rôle Co-Fonda
                allow: PermissionFlagsBits.ViewChannel,
              },
              {
                id: "1299068940689080341", // Rôle Staff
                allow: PermissionFlagsBits.ViewChannel,
              },
              {
                id: ticketCreatorId, // Demandeur du ticket
                allow: PermissionFlagsBits.ViewChannel,
              },
              {
                id: everyone.id, // Everyone
                deny: PermissionFlagsBits.ViewChannel,
              },
            ],
          })
          .then((c) => {
            const ticketboutique = new EmbedBuilder()
              .setTitle(`Ticket de ${interaction.user.username}.`)
              .setDescription(
                "Le support sera avec vous sous peu. \n Pour clôturer ce ticket réagissez avec 🔒"
              )
              .setColor("Green");

            const rowclaimcloseboutique = new ActionRowBuilder().addComponents(
              claimButon
            );

            const discriminant = "🛒";
            const channelCategory = "boutique";
            const targetGuild = interaction.guild;

            c.send({embeds: [ticketboutique],components: [rowclaimcloseboutique],});

            ticketDataCreation(interaction, ticketCreatorId, discriminant, c, targetGuild, channelCategory);
          });
        } catch (error) {
          console.error('Error creating ticket channel:', error);
          // Handle the error appropriately, e.g., send a message back to the user
        }
      }   

async function problèmeig(interaction, ticketCreatorId){
  try {
    const everyone = interaction.guild.roles.cache.find(
      (r) => r.name === "@everyone"
    );
    interaction.guild.channels
          .create({
            name: `📩・ticket-${interaction.user.username} `,
            type: ChannelType.GuildText,
            parent: "1299069016576622624", // Id Catégorie ticket
            permissionOverwrites: [
              {
                id: "1299067621383077908", // Rôle Fonda
                allow: PermissionFlagsBits.ViewChannel,
              },
              {
                id: "1299067622532583516", // Rôle Co-Fonda
                allow: PermissionFlagsBits.ViewChannel,
              },
              {
                id: "1299068940689080341", // Rôle Staff
                allow: PermissionFlagsBits.ViewChannel,
              },
              {
                id: ticketCreatorId, // Demandeur du ticket
                allow: PermissionFlagsBits.ViewChannel,
              },
              {
                id: everyone.id, // Everyone
                deny: PermissionFlagsBits.ViewChannel,
              },
            ],
          })
          .then((c) => {
            const ticketproblèmeig = new EmbedBuilder()
              .setTitle(`Ticket de ${interaction.user.username}.`)
              .setDescription(
                "Le support sera avec vous sous peu. \n Pour clôturer ce ticket réagissez avec 🔒"
              )
              .setColor("Green");

            const rowclaimcloseproblèmeig = new ActionRowBuilder().addComponents(
              claimButon
            );

            const discriminant = "📩";
            const channelCategory = "problèmeig";
            const targetGuild = interaction.guild;

            c.send({ embeds: [ticketproblèmeig], components: [rowclaimcloseproblèmeig] });

            ticketDataCreation(interaction, ticketCreatorId, discriminant, c, targetGuild, channelCategory)
          });
        } catch (error) {
          console.error('Error creating ticket channel:', error);
          // Handle the error appropriately, e.g., send a message back to the user
        }
      }   

async function signalerbug(interaction, ticketCreatorId){
  try {
    const everyone = interaction.guild.roles.cache.find(
      (r) => r.name === "@everyone"
    );
    interaction.guild.channels
    .create({
      name: `🔫・ticket-${interaction.user.username} `,
      type: ChannelType.GuildText,
      parent: "1299069018283708438", // Id Catégorie ticket
      permissionOverwrites: [
        {
          id: "1299067621383077908", // Rôle Fonda
          allow: PermissionFlagsBits.ViewChannel,
        },
        {
          id: "1299067622532583516", // Rôle Co-Fonda
          allow: PermissionFlagsBits.ViewChannel,
        },
        {
          id: "1299068940689080341", // Rôle Staff
          allow: PermissionFlagsBits.ViewChannel,
        },
        {
          id: ticketCreatorId, // Demandeur du ticket
          allow: PermissionFlagsBits.ViewChannel,
        },
        {
          id: everyone.id, // Everyone
          deny: PermissionFlagsBits.ViewChannel,
        },
      ],
    })
    .then((c) => {
      const ticketsignalerbug = new EmbedBuilder()
        .setTitle(`Ticket de ${interaction.user.username}.`)
        .setDescription(
          "Le support sera avec vous sous peu. \n Pour clôturer ce ticket réagissez avec 🔒"
        )
        .setColor("Green");

      const rowclaimclosesignalerbug = new ActionRowBuilder().addComponents(
        claimButon
      );

      const discriminant = "🔫";
      const channelCategory = "signalerbug";
      const targetGuild = interaction.guild;

      c.send({ embeds: [ticketsignalerbug], components: [rowclaimclosesignalerbug] });

      ticketDataCreation(interaction, ticketCreatorId, discriminant, c, targetGuild, channelCategory)
    });
  } catch (error) {
    console.error('Error creating ticket channel:', error);
    // Handle the error appropriately, e.g., send a message back to the user
  }
}    



//-----------------------------------TICKETS Chooser + creation données--------------------------------------------
async function ticketCreationChooser(interaction, ticketCreatorId, selectInteraction) {
  try {
    if (interaction.isStringSelectMenu()) {
      if (selectInteraction === "valoes") {
        await recruValo(interaction, ticketCreatorId);
      } else if (selectInteraction === "anulval") {
        await interaction.reply({ content: "L'action a été annulée.", ephemeral: true });
      }

      if (interaction.isStringSelectMenu() && interaction.customId === "recruselect") {
        if (selectInteraction === "recrumodo") {
          await recruModo(interaction, ticketCreatorId);
        } else if (selectInteraction === "plaintestaff") {
          await plaintestaff(interaction, ticketCreatorId);
        } else if (selectInteraction === "recrucom") {
          await recrucom(interaction, ticketCreatorId);
        } else if (selectInteraction === "demandedeban") {
          await demandedeban(interaction, ticketCreatorId);
        }
      }

      if (interaction.isStringSelectMenu() && interaction.customId === "legalselect") {
        if (selectInteraction === "depotdossier1") {
          await depotdossier1(interaction, ticketCreatorId);
        } else if (selectInteraction === "depotplainte1") {
          await depotplainte1(interaction, ticketCreatorId);
        } else if (selectInteraction === "evenement") {
          await evenement(interaction, ticketCreatorId);
        }
      }

      if (interaction.isStringSelectMenu() && interaction.customId === "illegalselect") {
        if (selectInteraction === "depotdossier2") {
          await depotdossier2(interaction, ticketCreatorId);
        } else if (selectInteraction === "depotplainte2") {
          await depotplainte2(interaction, ticketCreatorId);
        } else if (selectInteraction === "demandemortrp") {
          await demandemortrp(interaction, ticketCreatorId);
        }
      }

      if (interaction.isStringSelectMenu() && interaction.customId === "diversselect") {
        if (selectInteraction === "question") {
          await question(interaction, ticketCreatorId);
        } else if (selectInteraction === "boutique") {
          await boutique(interaction, ticketCreatorId);
        } else if (selectInteraction === "problèmeig") {
          await problèmeig(interaction, ticketCreatorId);
        } else if (selectInteraction === "signalerbug") {
          await signalerbug(interaction, ticketCreatorId);
        }
      }
    }
  } catch (error) {
    let where = "TicketChooser";
    console.log(`erreur survenue lors de la création ou deletion du ticket: ${error}`);
    await sendError(error, where);
  }
}

async function ticketDataCreation(interaction, ticketCreatorId, discriminant, c, targetGuild, channelCategory) {
  let dataGuildId = "";
  let interactionGuildId = interaction.guild.id;
  if (!targetGuild) {
    dataGuildId = interaction.guild.id;
  } else {
    dataGuildId = targetGuild.id;
  }

  // Vérification de l'existence d'un ticket dans la même catégorie
  db.query(`SELECT * FROM ticketinfos WHERE user = ${interaction.user.id} AND guildId = '${dataGuildId}' AND diminutif = '${discriminant}'`, async (err, req, fields) => {
    if (err) {
      let where = "TicketDataCreation ==> selectInfos";
      await sendError(err, where);
      console.log(err);
    }

    // Si l'utilisateur n'a pas de ticket dans cette catégorie
    if (req.length < 1) {
      const ticketUserName = interaction.user.username;
      const ticketUserId = interaction.user.id;
      const ticketName = `${discriminant}・ticket-${ticketUserName}`;
      const ticketChannel = c.id;
      const query = `INSERT INTO ticketinfos (user, ticketId, diminutif, date, guildId, channelCategory) VALUES ('${ticketUserId}', '${ticketChannel}', '${discriminant}', '${Date.now()}', '${dataGuildId}', '${channelCategory}')`;

      await db.query(query, async function (err) {
        if (err) {
          let where = "TicketDataCreation ==> insertInfo";
          await sendError(err, where);
          console.log(err);
        }
      });
      console.log(`Données créées pour le ticket ${discriminant}・ticket-${interaction.user.username}`);

      const guild = client.guilds.cache.get(dataGuildId);
      await client.guilds.fetch(guild.id).then(async targetGuild => {
        const memberToSearch = targetGuild.members.cache.get(ticketCreatorId);
        let guildLink = "";

        if (!memberToSearch) {
          let guildInvite = "";

          const channel = client.channels.cache.get(guildLink);
          const invite = await channel.createInvite();
          guildInvite = invite;

          await interaction.reply({ content: `<@${interaction.user.id}> Votre Ticket a bien été créé ! \nRendez-vous à votre ticket en cliquant ici ===> ${guildInvite}`, ephemeral: true });

          const twoHoursInMillis = 2 * 60 * 60 * 1000;
          setTimeout(async () => {
            const guild = client.guilds.cache.get(dataGuildId);
            const updatedMember = await guild.members.fetch(ticketUserId).catch(() => null);

            if (!updatedMember) {
              const targetChannel = client.channels.cache.get(ticketChannel);

              if (targetChannel) {
                try {
                  await targetChannel.send(`Le membre n'a pas rejoint après 2h. Je vais supprimer le ticket.`);
                  await wait(3000);

                  await targetChannel.delete();
                  const deleteQuery = `DELETE FROM ticketinfos WHERE ticketId = '${targetChannel.id}'`;
                  await db.query(deleteQuery, (err, results, fields) => {
                    if (err) {
                      console.error('Erreur lors de la suppression des données :', err);
                      throw err;
                    }
                    console.log(`Données supprimées avec succès \n${results}`);
                  });
                  console.log(`Le ticket ${targetChannel.name} a été supprimé après 2 heures car le membre n'est plus sur le serveur.`);
                } catch (error) {
                  console.error('Erreur lors de la suppression du ticket :', error);
                }
              }
            }
          }, twoHoursInMillis);
        } else {
          try {
            const channelUrl = `https://discord.com/channels/${dataGuildId}/${ticketChannel}`;

            await interaction.reply({ content: `<@${interaction.user.id}> Votre Ticket a bien été créé ! \nRendez-vous à votre ticket en cliquant ici ===> ${channelUrl}`, ephemeral: true });
          } catch (err) {
            let where = "TicketDataCreation ==> channelLink";
            await sendError(err, where);
            console.log("Erreur avec le lien du salon", err);
          }
        }
      });
    } else {
      // L'utilisateur a déjà un ticket dans cette catégorie
      await interaction.reply({ content: "Vous avez déjà un ticket ouvert dans cette catégorie.", ephemeral: true });
    }
  });
}

module.exports = {
  ticketCreationChooser,
  depotdossier1,
  depotdossier2,
  depotplainte1,
  depotplainte2,
  demandemortrp,
  evenement
};
