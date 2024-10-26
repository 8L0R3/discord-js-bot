const { Events } = require('discord.js');
const { db } = require('../events/connectDB');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}`);

    for (const guild of client.guilds.cache.values()) {
      try {
        const invites = await guild.invites.fetch();
        invites.forEach(async (invite) => {
          const { code, inviter, uses } = invite;
          await db.query('INSERT INTO invites (invite_code, inviter_id, inviter_name, uses) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE uses = ?', 
            [code, inviter.id, inviter.username, uses, uses]);
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des invitations :', error);
      }
    }
  },
};
