const { EmbedBuilder } = require("discord.js");
const { roleDeleteLogChannelId } = require("../config.json");

module.exports = {
  name: 'roleDelete',
  async execute(role) {
    const logChannel = role.guild.channels.cache.get(roleDeleteLogChannelId);
    if (!logChannel) {
      console.error(`Le salon de logs avec l'ID ${roleDeleteLogChannelId} est introuvable.`);
      return;
    }

    const auditLogs = await role.guild.fetchAuditLogs({
      type: 32, // Remplacer par le bon numéro correspondant à ROLE_DELETE
      limit: 1
    });

    const logEntry = auditLogs.entries.first();
    if (!logEntry) {
      console.error(`Aucun log trouvé pour la suppression du rôle.`);
      return;
    }

    const { executor } = logEntry;

    const deleteEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("Rôle supprimé")
      .setDescription(`Un rôle a été supprimé sur le serveur.`)
      .addFields(
        { name: 'Nom du rôle', value: role.name, inline: true },
        { name: 'ID du rôle', value: role.id, inline: true },
        { name: 'Position', value: role.position.toString(), inline: true },
        { name: 'Mentionnable', value: role.mentionable ? 'Oui' : 'Non', inline: true },
        { name: 'Gérable par bots', value: role.managed ? 'Oui' : 'Non', inline: true },
        { name: 'Date de création', value: role.createdAt.toLocaleString(), inline: true },
        { name: 'Supprimé par', value: `<@${executor.id}>`, inline: true } // Mention de l'exécuteur
      )
      .setTimestamp();

    try {
      await logChannel.send({ embeds: [deleteEmbed] });
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'embed de suppression de rôle : ${error}`);
    }
  },
};
