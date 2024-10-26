const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        // Remplacez 'role-id' par les IDs des rôles que vous voulez attribuer
        const roleIds = [
            '1299068953435312279', // ID du premier rôle
            '1299068953435312279', // ID du deuxième rôle
            '1299068953435312279'  // ID du troisième rôle
        ];

        // Trouver les rôles par leur ID et les attribuer au membre
        try {
            for (const roleId of roleIds) {
                const role = member.guild.roles.cache.get(roleId);
                if (role) {
                    await member.roles.add(role);
                }
            }
        } catch (error) {
            console.error(`Une erreur s'est produite lors de l'attribution des rôles à ${member.user.tag}`, error);
        }
    }
};
