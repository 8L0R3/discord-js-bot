const { EmbedBuilder } = require("discord.js");
const { welcomeChannelId, logswelcomeChannelId } = require("../config.json");

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const guild = member.guild;
    
    // Envoi du message de bienvenue dans le canal dédié
    const welcomeChannel = guild.channels.cache.get(welcomeChannelId);
    if (welcomeChannel) {
      const welcomeEmbed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("Ho ! Un nouveau membre !")
        .setDescription(`🎉 Bienvenue sur notre serveur GTA RP ! 🎉\n\nNous sommes ravis de vous accueillir dans notre monde où l'imagination et le roleplay prennent vie, ${member} !`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      welcomeChannel.send({ embeds: [welcomeEmbed] });
    }

    // Envoi de l'embed de log dans le salon de logs défini
    const logsChannel = guild.channels.cache.get(logswelcomeChannelId);
    if (logsChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("Nouveau Membre Rejoint")
        .setDescription(`Un nouveau membre ${member} a rejoint le serveur.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      logsChannel.send({ embeds: [logEmbed] });
    }
  },
};
