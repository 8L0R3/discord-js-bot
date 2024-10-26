const { Events } = require('discord.js');
const { db } = require('../events/connectDB');

module.exports = {
  name: Events.InviteDelete,
  async execute(invite) {
    try {
      await db.query('DELETE FROM invites WHERE invite_code = ?', [invite.code]);
      console.log(`Invitation ${invite.code} supprimée`);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'invitation :', error);
    }
  },
};
