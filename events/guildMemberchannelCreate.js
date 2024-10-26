const { EmbedBuilder } = require('discord.js');
const { channelCreateLogChannelId } = require('../config.json');

module.exports = {
  name: 'channelCreate',
  async execute(channel) {
    const logChannel = channel.guild.channels.cache.get(channelCreateLogChannelId);
    if (!logChannel) {
      console.error(`Le salon de logs avec l'ID ${channelCreateLogChannelId} est introuvable.`);
      return;
    }

    try {
      // Attendre un court instant pour permettre aux logs d'audit de se mettre à jour
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Récupérer les logs d'audit pour la création de canal
      const auditLogs = await channel.guild.fetchAuditLogs({
        type: 10, // Utilisation du type numérique pour la création de canal
        limit: 1,
      });

      const logEntry = auditLogs.entries.first();
      if (!logEntry) {
        console.error(`Aucun log trouvé pour la création du salon.`);
        return;
      }

      const executor = logEntry.executor;

      // Créer l'embed en utilisant EmbedBuilder
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Nouveau Salon Créé')
        .setDescription(`Un nouveau salon a été créé par <@${executor.id}>.`)
        .addFields(
          { name: 'Nom du Salon', value: channel.name, inline: true },
          { name: 'ID du Salon', value: channel.id, inline: true },
          { name: 'Type de Salon', value: channel.type === 'GUILD_TEXT' ? 'Textuel' : 'Vocal', inline: true },
          { name: 'Créé par', value: `<@${executor.id}>`, inline: true } // Mentionne le créateur
        )
        .setTimestamp();

      console.log(`Envoi de l'embed au salon de logs...`);
      await logChannel.send({ embeds: [embed] });
      console.log(`Embed envoyé avec succès.`);

    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'embed de création de salon : ${error}`);
    }
  },
};



