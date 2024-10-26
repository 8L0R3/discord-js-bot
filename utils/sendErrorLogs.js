const { EmbedBuilder } = require("discord.js");

module.exports = {
    sendError,  // Exportation de la fonction sendError
};

async function sendError(client, error, err, where) {
    let errorToSend = '';

    if (error instanceof Error) {
        errorToSend = error.stack;
    } else if (err) {
        errorToSend = err instanceof Error ? err.stack : err;
    }

    if (!errorToSend) {
        console.error('Aucune erreur à envoyer');
        return;
    }

    const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`Il y a eu une erreur lors de l'exécution dans: ${where}`)
        .setDescription(`Error logs:\n\n${errorToSend}`)
        .setThumbnail(`https://cdn.discordapp.com/attachments/1060932238503583855/1135255846834688090/warning-sign.gif`)
        .setTimestamp()
        .setFooter({ text: 'Report le :' });

    const NoahId = "466643280206102528";
    const AlexId = "1042561644871561246"
    const user = client.users.cache.get(NoahId);
    const user2 = client.users.cache.get(AlexId);
    if (user) {
        await user.send({ embeds: [errorEmbed] });
    } else {
        console.log("Utilisateur introuvable");
    }
    if (user2) {
        await user2.send({ embeds: [errorEmbed] });
    } else {
        console.log("Utilisateur 2 introuvable");
    }
}



