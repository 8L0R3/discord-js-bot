const { EmbedBuilder } = require("discord.js");
const { roleretireLogChannelId, roleaddLogChannelId } = require("../config.json");

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    if (oldMember.roles.cache.size > newMember.roles.cache.size) {
      // Récupérer les rôles retirés
      const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

      // Vérifier s'il y a des rôles retirés
      if (removedRoles.size > 0) {
        const logChannel = oldMember.guild.channels.cache.get(roleretireLogChannelId);
        if (!logChannel) {
          console.error(`Le salon de logs avec l'ID ${roleretireLogChannelId} est introuvable.`);
          return;
        }

        // Récupérer l'utilisateur qui a retiré le rôle
        const auditLogs = await oldMember.guild.fetchAuditLogs({
          type: 30, // Remplacez par le nombre correct pour MEMBER_ROLE_UPDATE
          limit: 1
        });

        const logEntry = auditLogs.entries.first();
        if (!logEntry) {
          console.error(`Aucun log trouvé pour la mise à jour des rôles du membre.`);
          return;
        }

        const executor = logEntry.executor;

        // Construire l'embed de logs pour les rôles retirés
        const logEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Rôles Retirés")
          .setDescription(`${newMember.user} a perdu le(s) rôle(s) suivant(s):`)
          .addFields(
            { name: 'Rôles Retirés', value: removedRoles.map(role => role.name).join(', ') },
            { name: 'Membre', value: `${newMember.user}`, inline: true },
            { name: 'Action par', value: `${executor}`, inline: true },
            { name: 'Date', value: new Date().toLocaleString(), inline: true }
          )
          .setTimestamp();

        // Envoyer l'embed dans le salon de logs des rôles retirés
        try {
          await logChannel.send({ embeds: [logEmbed] });
        } catch (error) {
          console.error(`Erreur lors de l'envoi de l'embed de logs pour les rôles retirés : ${error}`);
        }
      }
    } else if (oldMember.roles.cache.size < newMember.roles.cache.size) {
      // Récupérer les rôles ajoutés
      const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));

      // Vérifier s'il y a des rôles ajoutés
      if (addedRoles.size > 0) {
        const logChannel = newMember.guild.channels.cache.get(roleaddLogChannelId);
        if (!logChannel) {
          console.error(`Le salon de logs avec l'ID ${roleaddLogChannelId} est introuvable.`);
          return;
        }

        // Récupérer l'utilisateur qui a ajouté le rôle
        const auditLogs = await newMember.guild.fetchAuditLogs({
          type: 30, // Remplacez par le nombre correct pour MEMBER_ROLE_UPDATE
          limit: 1
        });

        const logEntry = auditLogs.entries.first();
        if (!logEntry) {
          console.error(`Aucun log trouvé pour la mise à jour des rôles du membre.`);
          return;
        }

        const executor = logEntry.executor;

        // Construire l'embed de logs pour les rôles ajoutés
        const logEmbed = new EmbedBuilder()
          .setColor("#00FF00")
          .setTitle("Rôles Ajoutés")
          .setDescription(`${newMember.user} a obtenu le(s) rôle(s) suivant(s):`)
          .addFields(
            { name: 'Rôles Ajoutés', value: addedRoles.map(role => role.name).join(', ') },
            { name: 'Membre', value: `${newMember.user}`, inline: true },
            { name: 'Action par', value: `${executor}`, inline: true },
            { name: 'Date', value: new Date().toLocaleString(), inline: true }
          )
          .setTimestamp();

        // Envoyer l'embed dans le salon de logs des rôles ajoutés
        try {
          await logChannel.send({ embeds: [logEmbed] });
        } catch (error) {
          console.error(`Erreur lors de l'envoi de l'embed de logs pour les rôles ajoutés : ${error}`);
        }
      }
    }
  },
};




