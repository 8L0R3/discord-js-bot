const { EmbedBuilder } = require("discord.js");
const { goodbyeChannelId, goodbyeLogChannelId } = require("../config.json");

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const goodbyeChannel = member.guild.channels.cache.get(goodbyeChannelId);
    if (!goodbyeChannel) return;

    // Création de l'embed pour le message d'adieu
    const goodbyeEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("Un membre vient de partir… 😢")
      .setDescription(`À bientôt ${member} !\n\nAprès une période agréable passée sur ce serveur, il est temps pour moi de dire au revoir. Prenez soin de vous. 👋`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    // Envoi de l'embed dans le canal de départ
    await goodbyeChannel.send({ embeds: [goodbyeEmbed] });

    // Envoi de l'embed de logs dans le salon de logs spécifié
    const logChannel = member.guild.channels.cache.get(goodbyeLogChannelId);
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Membre Parti")
        .setDescription(`${member} a quitté le serveur.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      await logChannel.send({ embeds: [logEmbed] });
    } 
  },
};
