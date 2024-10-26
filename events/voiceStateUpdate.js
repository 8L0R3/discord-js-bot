const { Events, EmbedBuilder } = require('discord.js');
const { exemptUserIds } = require('../config.json'); // Assurez-vous que ce fichier contient les IDs d'exemption

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        const joinChannel = '1299069235200397332'; // Remplacez par l'ID du salon de logs pour les joins
        const leaveChannel = '1299069236819263548'; // Remplacez par l'ID du salon de logs pour les leaves

        const guild = newState.guild;
        const memberId = newState.member.id;

        // Vérifier si l'utilisateur est exempté
        if (exemptUserIds.includes(memberId)) {
            return; // Ne pas envoyer de logs pour les utilisateurs exemptés
        }

        // Rejoindre un salon vocal
        if (!oldState.channel && newState.channel) {
            const embed = new EmbedBuilder()
                .setTitle('Membre a rejoint un salon vocal')
                .setDescription(`<@${newState.member.user.id}> a rejoint le salon <#${newState.channel.id}>`)
                .setColor('Green')  // Utilisez une valeur hexadécimale si "Green" ne fonctionne pas
                .setThumbnail(newState.member.user.displayAvatarURL())
                .addFields(
                    { name: 'Utilisateur', value: `<@${newState.member.user.id}>`, inline: true },
                    { name: 'Salon', value: `<#${newState.channel.id}>`, inline: true },
                    { name: 'Heure', value: new Date().toLocaleString(), inline: true }
                );

            const logChannel = guild.channels.cache.get(joinChannel);
            if (logChannel) logChannel.send({ embeds: [embed] });
        }

        // Quitter un salon vocal
        if (oldState.channel && !newState.channel) {
            const embed = new EmbedBuilder()
                .setTitle('Membre a quitté un salon vocal')
                .setDescription(`<@${oldState.member.user.id}> a quitté le salon <#${oldState.channel.id}>`)
                .setColor('Red')  // Utilisez une valeur hexadécimale si "Red" ne fonctionne pas
                .setThumbnail(oldState.member.user.displayAvatarURL())
                .addFields(
                    { name: 'Utilisateur', value: `<@${oldState.member.user.id}>`, inline: true },
                    { name: 'Salon', value: `<#${oldState.channel.id}>`, inline: true },
                    { name: 'Heure', value: new Date().toLocaleString(), inline: true }
                );

            const logChannel = guild.channels.cache.get(leaveChannel);
            if (logChannel) logChannel.send({ embeds: [embed] });
        }
    },
};
