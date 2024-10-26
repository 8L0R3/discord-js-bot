const { waitingVoiceChannelId, exemptUserId, exemptRoleId } = require('../../config.json');
const waitingList = [];

module.exports = {
    waitingList,
    handleVoiceUpdate(oldState, newState, client) {
        const member = newState.member;

        // Vérifiez si l'utilisateur est celui à exclure ou s'il possède un rôle spécifique à exclure
        if (member.id === exemptUserId || member.roles.cache.has(exemptRoleId)) {
            return;
        }

        // Si l'utilisateur rejoint le salon vocal spécifique
        if (newState.channelId === waitingVoiceChannelId && !waitingList.includes(member.id)) {
            waitingList.push(member.id);
        }

        // Si l'utilisateur quitte le salon vocal spécifique
        if (oldState.channelId === waitingVoiceChannelId && newState.channelId !== waitingVoiceChannelId) {
            const index = waitingList.indexOf(member.id);
            if (index > -1) {
                waitingList.splice(index, 1);
            }
        }
    }
};
