const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearuser')
    .setDescription('Supprime tous les messages d\'un utilisateur dans le serveur.')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('L\'utilisateur dont vous souhaitez supprimer les messages')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    let totalDeleted = 0;

    await interaction.deferReply(); // Pour gérer le temps de traitement

    for (const channel of interaction.guild.channels.cache.values()) {
      if (channel.isTextBased()) {
        let fetchMore = true;
        let lastId = null;

        while (fetchMore) {
          const options = { limit: 100 };
          if (lastId) {
            options.before = lastId;
          }

          const messages = await channel.messages.fetch(options);
          const userMessages = messages.filter(msg => msg.author.id === user.id);

          for (const msg of userMessages.values()) {
            try {
              await msg.delete();
              totalDeleted++;
            } catch (err) {
              console.error(`Erreur lors de la suppression du message ${msg.id}:`, err);
            }
          }

          lastId = messages.last()?.id;

          // Si moins de 100 messages ont été récupérés, c'est qu'il n'y a plus de messages à fetch.
          fetchMore = messages.size === 100;
        }
      }
    }

    await interaction.editReply(`Tous les messages de ${user.tag} ont été supprimés dans le serveur. Total supprimé: ${totalDeleted} messages.`);
  },
};
