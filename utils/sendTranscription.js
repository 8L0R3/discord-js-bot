const { sendError } = require('../utils/sendErrorLogs');

async function sendTranscription(client, user, transcription) {
  try {
    if (typeof transcription !== 'string') {
      throw new TypeError('La transcription doit être une chaîne de caractères.');
    }

    await user.send({
      content: 'Voici la transcription de votre ticket :',
      files: [{ attachment: Buffer.from(transcription), name: 'transcription.html' }],
    });
  } catch (error) {
    if (error.code === 50007) {  // Cannot send messages to this user
      console.log(`Impossible d'envoyer un message à ${user.tag} (DM désactivés ou bot bloqué).`);
      // Envoyer un message dans le canal à la place si nécessaire
      let where = "sendTranscription.js ==> sendTranscription";
      await sendError(error, where);

      // Remplacer ceci par le canal approprié où vous souhaitez notifier l'utilisateur.
      const channelId = '1299069254469025853'; // Remplacez 'ID_DU_CHANNEL' par l'ID réel
      const channel = await client.channels.fetch(channelId);
      if (channel) {
        await channel.send(`${user}, nous ne pouvons pas vous envoyer de messages privés. Veuillez activer les DM ou contactez un administrateur.`);
      }
    } else {
      throw error;
    }
  }
}

module.exports = {
  sendTranscription
};
