const { EmbedBuilder } = require("discord.js");
const { roleCreateLogChannelId } = require("../config.json");

module.exports = {
  name: 'roleCreate',
  async execute(role) {
    const logChannel = role.guild.channels.cache.get(roleCreateLogChannelId);
    if (!logChannel) {
      console.error(`Le salon de logs avec l'ID ${roleCreateLogChannelId} est introuvable.`);
      return;
    }

    const auditLogs = await role.guild.fetchAuditLogs({
      type: 30, // Remplacer par le bon numéro correspondant à ROLE_CREATE
      limit: 1
    });

    const logEntry = auditLogs.entries.first();
    if (!logEntry) {
      console.error(`Aucun log trouvé pour la création du rôle.`);
      return;
    }

    const { executor } = logEntry;

    const createEmbed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("Nouveau rôle créé")
      .setDescription(`Un nouveau rôle a été créé sur le serveur.`)
      .addFields(
        { name: 'Nom du rôle', value: role.name, inline: true },
        { name: 'ID du rôle', value: role.id, inline: true },
        { name: 'Position', value: role.position.toString(), inline: true },
        { name: 'Mentionnable', value: role.mentionable ? 'Oui' : 'Non', inline: true },
        { name: 'Gérable par bots', value: role.managed ? 'Oui' : 'Non', inline: true },
        { name: 'Date de création', value: role.createdAt.toLocaleString(), inline: true },
        { name: 'Créé par', value: `<@${executor.id}>`, inline: true } // Mention de l'exécuteur
      )
      .setTimestamp();

    try {
      await logChannel.send({ embeds: [createEmbed] });
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'embed de création de rôle : ${error}`);
    }
  },
};
