const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, PermissionFlagsBits, ButtonStyle, TextChannel } = require("discord.js");
const { buttondelete, buttonUnclaim } = require('../ressources/bouttons');
const { db } = require("./connectDB");
const { client } = require('../index');
const wait = require("node:timers/promises").setTimeout;
const { setTimeout } = require('timers/promises');
const { guildId, authorizedRoleId, transcriptChannelId, ownerId, devBotId } = require("../config.json"); 
const { sendError } = require('../utils/sendErrorLogs'); // Importer la fonction pour gérer les erreurs
const { sendTranscription } = require('../utils/sendTranscription'); // Importer la fonction de gestion des DM pour la transcription

// Variable globale pour sauvegarder l'embed principal
let mainEmbed = null;

// Variable globale pour sauvegarder l'ID de l'interaction où l'embed de suppression a été envoyé
let deleteEmbedInteractionId = null;

// Variable globale pour sauvegarder le nom personnalisé d'origine
let originalChannelName = '';

async function claimTicket(interaction) {
  try {
    const channelInteraction = interaction.channel.id;
    const recupQuery = `SELECT * FROM ticketinfos WHERE ticketId = '${channelInteraction}'`;

    await db.query(recupQuery, async (err, dataRows, fields) => {
      if (err) throw err;

      if (dataRows.length > 0) {
        const ticketDiscriminant = dataRows[0].diminutif;
        const ticketUserId = dataRows[0].user;
        const timestamp = dataRows[0].date;
        let user, userTag;

        try {
          user = await client.users.fetch(ticketUserId);
          userTag = user.tag;
        } catch (fetchError) {
          console.warn(`Impossible de récupérer l'utilisateur avec l'ID ${ticketUserId}. L'utilisateur a probablement quitté le serveur.`);
          userTag = "Utilisateur inconnu";
          user = null; // Utilisateur introuvable
        }

        const date = new Date(parseInt(timestamp));
        mainEmbed = new EmbedBuilder()
          .setTitle("Nouveau Ticket")
          .setDescription(`Ticket créé par ${userTag}`)
          .setColor("Blue")
          .setTimestamp(date);

        originalChannelName = interaction.channel.name;

        if (user) {
          await interaction.channel.permissionOverwrites.edit(ticketUserId, {
            deny: PermissionFlagsBits.ViewChannel,
          });
        }

        interaction.channel.setName(`🔒│${ticketDiscriminant}│${userTag}`);

        const claimEmbed = new EmbedBuilder()
          .setTitle("Ticket Claim 🔒")
          .setDescription("Le ticket a été claim. Vous pouvez rouvrir le ticket ou le supprimer")
          .setColor("Yellow")
          .setTimestamp(date);

        const rowdeldiv = new ActionRowBuilder().addComponents(buttondelete, buttonUnclaim);

        await interaction.reply({
          embeds: [claimEmbed],
          components: [rowdeldiv],
        });

        // Planifiez la suppression du ticket une heure après que le créateur ait quitté le serveur
        scheduleTicketDeletion(channelInteraction, 3600000);
      } else {
        const claimEmbed2 = new EmbedBuilder()
          .setTitle("Ticket Claim 🔒")
          .setDescription("Le ticket a été claim. Vous pouvez rouvrir le ticket ou le supprimer")
          .setColor("Yellow");

        const rowdeldiv2 = new ActionRowBuilder().addComponents(buttondelete);
        await interaction.reply({
          embeds: [claimEmbed2],
          components: [rowdeldiv2],
        });

        console.error("Aucun enregistrement correspondant n'a été trouvé dans la base de données.");
      }
    });
  } catch (error) {
    console.error("Une erreur est survenue : ", error);
  }
}

async function unclaimTicket(interaction) {
  try {
    await interaction.reply({ content: "Réouverture du ticket dans quelques secondes.", ephemeral: true });

    const channelInteraction = interaction.channel.id;
    const recupQuery = `SELECT * FROM ticketinfos WHERE ticketId = '${channelInteraction}'`;

    await db.query(recupQuery, async (err, dataRows, fields) => {
      if (err) throw err;

      if (dataRows.length > 0) {
        const ticketUserId = dataRows[0].user;
        let user, userTag;

        try {
          user = await client.users.fetch(ticketUserId);
          userTag = user.tag;
        } catch (fetchError) {
          console.warn(`Impossible de récupérer l'utilisateur avec l'ID ${ticketUserId}. L'utilisateur a probablement quitté le serveur.`);
          userTag = "Utilisateur inconnu";
          user = null; // Utilisateur introuvable
        }

        // Rétablir les permissions
        if (user) {
          await interaction.channel.permissionOverwrites.edit(ticketUserId, {
            allow: PermissionFlagsBits.ViewChannel,
          });
        }

        // Restaurer le nom personnalisé d'origine
        await interaction.channel.setName(originalChannelName);

        // Supprimer l'embed "Ticket Claim"
        const messages = await interaction.channel.messages.fetch({ limit: 1 });
        const claimMessage = messages.first();
        if (claimMessage && claimMessage.embeds.length > 0 && claimMessage.embeds[0].title === "Ticket Claim 🔒") {
          await claimMessage.delete();
        }

        // Envoyer un message indiquant que le ticket a été réouvert
        const reopenEmbed = new EmbedBuilder()
          .setTitle("Ticket Réouvert 🔓")
          .setDescription("Le ticket a été réouvert. Vous pouvez maintenant continuer la discussion.")
          .setColor("Green");

        await interaction.channel.send({ embeds: [reopenEmbed] });

        // Suivi de l'interaction pour informer de la réouverture du ticket
        await interaction.followUp({ content: `Le ticket a été réouvert et les permissions ont été restaurées.`, ephemeral: true });
      }
    });
  } catch (error) {
    console.error("Une erreur est survenue lors de la réouverture du ticket : ", error);
  }
}

async function scheduleTicketDeletion(ticketId, delay) {
  setTimeout(async () => {
    const recupQuery = `SELECT * FROM ticketinfos WHERE ticketId = '${ticketId}'`;

    db.query(recupQuery, async (err, dataRows, fields) => {
      if (err) throw err;

      if (dataRows.length > 0) {
        const ticketUserId = dataRows[0].user;

        try {
          await client.guilds.cache.get(guildId).members.fetch(ticketUserId);
          console.log(`L'utilisateur ${ticketUserId} est toujours dans le serveur.`);
        } catch (fetchError) {
          console.warn(`L'utilisateur ${ticketUserId} a quitté le serveur. Suppression du ticket.`);
          deleteTicketById(ticketId);
        }
      }
    });
  }, delay);
}

async function deleteTicketById(interaction) {
  try {
    const channelInteraction = interaction.channel.id;
    const member = interaction.member;
    
    // Vérifier si le membre possède le rôle autorisé
    if (!member.roles.cache.has(authorizedRoleId) && !member.roles.cache.has(devBotId)) {
      return interaction.reply({ content: "Vous n'avez pas la permission de supprimer ce ticket.", ephemeral: true });
    }    

    if (interaction.customId === "btnDeleteTicket") {
      const recupQuery = `SELECT * FROM ticketinfos WHERE ticketId = '${channelInteraction}'`;

      await db.query(recupQuery, async (err, dataRows, fields) => {
        if (err) throw err;

        if (dataRows.length > 0) {
          const ticketUserId = dataRows[0].user;
          const user = await client.users.fetch(ticketUserId);

          const suppTicketEmbed = new EmbedBuilder()
            .setTitle("Suppression du Ticket")
            .setDescription("Dans moins de 5 secondes")
            .setColor("Red");
          
          // Envoyer l'embed de suppression
          const reply = await interaction.channel.send({ embeds: [suppTicketEmbed] });

          // Sauvegarder l'ID de l'interaction où l'embed de suppression a été envoyé
          deleteEmbedInteractionId = reply.id;

          await wait(5000);

          // Récupérer les messages du canal avant qu'il ne soit supprimé
          const messages = await interaction.channel.messages.fetch({ limit: 100 }); // Limitez au besoin

          let transcriptHTML = `
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; }
                .message { margin-bottom: 10px; padding: 10px; border: 1px solid #ccc; }
                .author { font-weight: bold; }
                .content { margin-top: 5px; }
              </style>
            </head>
            <body>
              <h1>Transcription du Ticket : ${originalChannelName}</h1>
          `;

          messages.forEach(message => {
            const author = message.author.tag;
            const date = new Date(message.createdTimestamp).toLocaleString();
            const content = message.cleanContent.replace(/\n/g, '<br>');

            transcriptHTML += `
              <div class="message">
                <div class="author">${author} - ${date}</div>
                <div class="content">${content}</div>
              </div>
            `;
          });

          transcriptHTML += `
            </body>
            </html>
          `;

          // Enregistrer la transcription dans la base de données
          const saveTranscriptQuery = `INSERT INTO transcripts (channelId, transcript) VALUES (?, ?)`;
          await db.query(saveTranscriptQuery, [channelInteraction, transcriptHTML], (err) => {
            if (err) throw err;
          });

          // Envoyer la transcription dans le salon défini
          const transcriptChannel = client.channels.cache.get(transcriptChannelId);
          if (transcriptChannel && transcriptChannel instanceof TextChannel) {
          await transcriptChannel.send({ content: 'Transcription du ticket supprimé :', files: [{ attachment: Buffer.from(transcriptHTML), name: 'transcription.html' }] });
          }

          // Envoyer la transcription à l'utilisateur qui a créé le ticket via la fonction sendTranscription
          if (transcriptHTML) {
            await sendTranscription(client, user, transcriptHTML);
          } else {
            console.error("Erreur : transcription est undefined ou null.");
          }

          // Supprimer le canal
          await interaction.channel.delete(`${interaction.channel.name}`, {
            permissionOverwrites: [
              {
                allow: PermissionFlagsBits.ManageMessages,
              },
            ],
          });

          // Supprimer les données de la base de données
          const deleteQuery = `DELETE FROM ticketinfos WHERE ticketId = '${channelInteraction}'`;
          await db.query(deleteQuery, (err, results) => {
            if (err) throw err;
            console.log(`Données supprimées avec succès \n${results}`);
          });

          // Supprimer la transcription de la base de données après l'envoi
          const deleteTranscriptQuery = `DELETE FROM transcripts WHERE channelId = '${channelInteraction}'`;
          await db.query(deleteTranscriptQuery, (err, results) => {
            if (err) throw err;
            console.log(`Transcription supprimée avec succès \n${results}`);
          });
        }
      });
    }
  } catch (error) {
    console.error("Une erreur est survenue lors de la suppression du ticket : ", error);
  }
}

module.exports = {
  claimTicket,
  deleteTicketById,
  unclaimTicket,
};
