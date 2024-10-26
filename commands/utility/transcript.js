const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, GatewayIntentBits, EmbedBuilder, TextChannel, PermissionFlagsBits } = require('discord.js');
const { client } = require('../../index');
const transcriptChannelId = '1299069254469025853'; // Remplacez par l'ID de votre canal de transcription

module.exports = {
  data: new SlashCommandBuilder()
    .setName('transcript')
    .setDescription('Génère un transcript des messages dans le canal.'),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: "Vous n'avez pas la permission d'exécuter cette commande.",
        ephemeral: true,
      });
    }

    const channel = interaction.channel;
    const messages = await channel.messages.fetch({ limit: 100 });

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
        <h1>Transcription du Canal : ${channel.name}</h1>
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

    // Enregistrez le transcript dans le canal de transcription
    const transcriptChannel = client.channels.cache.get(transcriptChannelId);
    if (transcriptChannel && transcriptChannel instanceof TextChannel) {
      await transcriptChannel.send({
        content: 'Transcription du canal :',
        files: [{ attachment: Buffer.from(transcriptHTML), name: 'transcription.html' }],
      });
    }

    // Répondez à l'interaction
    await interaction.reply({
      content: 'La transcription a été enregistrée.',
      ephemeral: true,
    });
  },
};
