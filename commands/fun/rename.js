const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js'); // Assurez-vous d'importer les permissions nécessaires

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rename')
    .setDescription('Renomme un ticket')
    .addStringOption(option => 
      option.setName('nom')
        .setDescription('Le nouveau nom du ticket')
        .setRequired(true)),
  async execute(interaction) {
    const newName = interaction.options.getString('nom');
    const channel = interaction.channel;

    // Vérifiez si l'utilisateur a le rôle de modérateur
    const moderatorRoleId = '1299068940689080341'; // Remplacez par l'ID réel du rôle de modérateur
    const member = interaction.member;

    if (!member.roles.cache.has(moderatorRoleId)) {
      return interaction.reply({ content: 'Cette commande est réservée aux modérateurs.', ephemeral: true });
    }

    // Vérifiez si le canal contient l'emoji '・' dans le nom
    if (!channel.name.includes('・')) {
      return interaction.reply({ content: 'Cette commande ne peut être utilisée que dans un canal de ticket.', ephemeral: true });
    }

    try {
      // Extraire la partie du nom du ticket avant l'emoji '・'
      const parts = channel.name.split('・');
      const prefix = parts[0].trim(); // Garder le préfixe incluant l'emoji et les caractères précédents
      console.log(`Préfixe extrait: ${prefix}`); // Debug: Afficher le préfixe

      // Supprime les espaces superflus avant et après le nouveau nom
      const trimmedNewName = newName.trim();
      console.log(`Nouveau nom du ticket: ${trimmedNewName}`); // Debug: Afficher le nouveau nom

      // Renomme le canal en utilisant le même préfixe et le nouveau nom fourni
      await channel.setName(`${prefix}・${trimmedNewName}`);
      await interaction.reply(`Le ticket a été renommé en ${prefix}・${trimmedNewName}.`);
    } catch (error) {
      console.error('Erreur lors du renommage du ticket :', error);
      await interaction.reply({ content: 'Une erreur est survenue lors du renommage du ticket.', ephemeral: true });
    }
  },
};
