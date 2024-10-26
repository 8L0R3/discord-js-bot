const SPECIAL_ROLE_ID = '1299176836898754592';  // Remplacez par l'ID du rôle spécialisé
const TARGET_STATUS = 'discord.gg/sunlifesw';  // Le statut personnalisé cible
const CHECK_INTERVAL = 3 * 60 * 1000; // Intervalle de 3 minutes en millisecondes

module.exports = (client) => {
    // Vérifie le statut d'un membre et attribue ou retire le rôle spécialisé
    const checkMemberStatus = async (member) => {
        const customStatus = member.presence?.activities.find(activity => activity.type === 4);

        if (customStatus && customStatus.state && customStatus.state.includes(TARGET_STATUS)) {
            // Si le membre a le statut cible, on lui attribue le rôle spécialisé
            if (!member.roles.cache.has(SPECIAL_ROLE_ID)) {
                await member.roles.add(SPECIAL_ROLE_ID);
                console.log(`Rôle spécialisé attribué à ${member.user.tag}`);
            }
        } else {
            // Si le membre n'a plus le statut cible, on lui retire le rôle spécialisé
            if (member.roles.cache.has(SPECIAL_ROLE_ID)) {
                await member.roles.remove(SPECIAL_ROLE_ID);
                console.log(`Rôle spécialisé retiré à ${member.user.tag}`);
            }
        }
    };

    // Vérifie le statut de tous les membres toutes les 3 minutes
    setInterval(async () => {
        const guilds = client.guilds.cache;
        guilds.forEach(async (guild) => {
            const members = await guild.members.fetch(); // Récupère tous les membres de la guilde
            members.forEach(member => {
                checkMemberStatus(member);
            });
        });
    }, CHECK_INTERVAL);

    // Vérifie le statut lors de la mise à jour de la présence
    client.on('presenceUpdate', (oldPresence, newPresence) => {
        const member = newPresence.member;
        checkMemberStatus(member);
    });
};
