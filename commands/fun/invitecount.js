const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { db } = require('../../events/connectDB'); // Assurez-vous que le chemin est correct

async function handleInviteCount(interaction) {
  try {
    const username = interaction.user.username;

    // Requête pour obtenir le nombre total d'invitations
    const [invitesRows] = await db.query('SELECT COUNT(*) AS total_invited FROM invites WHERE inviter_name = ? AND remaining = TRUE', [username]);

    // Vérifiez le format des résultats
    if (!Array.isArray(invitesRows) || invitesRows.length === 0) {
      throw new Error('Les résultats de la requête ne sont pas au format attendu.');
    }

    // Calcul des statistiques
    const totalInvites = invitesRows[0].total_invited;

    // Création de l'embed pour afficher les informations
    const inviteCountEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Statistiques d\'Invitation')
      .setDescription(`Voici les statistiques des invitations pour ${interaction.user.tag}.`)
      .addFields(
        { name: 'Nom d\'Utilisateur', value: username, inline: true },
        { name: 'Invitations Totales', value: `${totalInvites}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [inviteCountEmbed] });
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la commande /invitecount:', error);
    await interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de la commande.', ephemeral: true });
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invitecount')
    .setDescription('Affiche les statistiques d\'invitations pour l\'utilisateur exécutant la commande.'),
  async execute(interaction) {
    await handleInviteCount(interaction);
  },
};
