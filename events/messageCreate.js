const { Events, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { client } = require("../index");
const { db } = require("./connectDB");
const { utilisateurSuspect, membreRole } = require("../ressources/tickets-ressources/generalServInfo.json");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        await verifyUserIsntBot(message);
        await handleRSCommand(message, '!rs');
        await handleMtcCommand(message, '!mtc');
    }
};

// Récupération des mots dans la DB
async function getWordsFromDb() {
    const wordsToDetectQuery = `SELECT * FROM botWordsNLinksToDetect WHERE type = 'word'`;
    return new Promise((resolve, reject) => {
        db.query(wordsToDetectQuery, (err, dataRows) => {
            if (err) {
                reject(err);
                return;
            }
            const words = dataRows.map(row => row.objets);
            resolve(words);
        });
    });
}

// Récupération des liens dans la DB
async function getLinksFromDb() {
    const linksToDetectQuery = `SELECT * FROM botWordsNLinksToDetect WHERE type = 'link'`;
    return new Promise((resolve, reject) => {
        db.query(linksToDetectQuery, (err, dataRows) => {
            if (err) {
                reject(err);
                return;
            }
            const links = dataRows.map(row => row.objets);
            resolve(links);
        });
    });
}

// Vérification de l'utilisateur
async function verifyUserIsntBot(message) {
    if (!message.member || message.member.permissions.has(PermissionFlagsBits.Administrator) || message.author.id === client.user.id) {
        return;
    }

    const textMessage = message.content.trim().toLowerCase();
    const wordsToDetect = await getWordsFromDb();
    const linksToDetect = await getLinksFromDb();

    const additionalLinksToDetect = [
        'twitch.tv',
        'discord.gg',
        'discord.com/invite'
    ];

    const allLinksToDetect = [...linksToDetect, ...additionalLinksToDetect];
    const atLeastOneWordPresent = wordsToDetect.some(word => textMessage.includes(word));
    const atLeastOneLinkPresent = allLinksToDetect.some(link => textMessage.includes(link));

    const allowedChannels = ['1299069063871598715', '1299069063871598715'];
    const allowedRoleForDiscordLinks = '1259570438728716339';

    if ((atLeastOneWordPresent || atLeastOneLinkPresent) && !allowedChannels.includes(message.channel.id)) {
        const memberRoles = message.member.roles.cache;
        const isAllowedRole = memberRoles.has(allowedRoleForDiscordLinks);

        if (atLeastOneLinkPresent && isAllowedRole && textMessage.includes('discord')) {
            return;
        } else {
            const numberOfWordsDetected = wordsToDetect.filter(word => textMessage.includes(word)).length;
            const rewrittenMessage = textMessage.replace(new RegExp(wordsToDetect.join('|'), 'g'), match => `**${match}**`);
            const guild = message.guild;

            if (!guild || !message.author) {
                return;
            }

            const targetMember = guild.members.cache.get(message.author.id);
            if (!targetMember) {
                return;
            }

            await targetMember.roles.add(utilisateurSuspect);
            await targetMember.roles.remove(membreRole);
            const reason = "Utilisateur suspecté d'être un bot ou de partager des liens non autorisés.";
            const quarantineTime = 1000 * 60 * 60 * 5;
            await targetMember.timeout(quarantineTime, reason);

            try {
                await message.delete();
            } catch (err) {
                // Erreur lors de la suppression du message
            }

            try {
                const channelToSendLog = guild.channels.cache.get("1299069228800016394");
                if (channelToSendLog) {
                    const susUserEmbed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle(`${message.author.username} est suspecté d'être un bot ou de partager des liens non autorisés.`)
                        .setDescription(`Nombre de mots/signes détectés: ${numberOfWordsDetected}\nMessage de l'utilisateur:\n${rewrittenMessage}\n\nLe message a été supprimé pour éviter tout risque.`)
                        .addFields({ name: 'Salon:', value: `<#${message.channel.id}>` })
                        .setThumbnail(targetMember.user.displayAvatarURL());

                    const confirmUserIsABot = new ButtonBuilder()
                        .setCustomId(`userisBotBtn_${targetMember.id}`)
                        .setLabel("Bannir l'utilisateur")
                        .setStyle(ButtonStyle.Danger);

                    const cancelUserIsABot = new ButtonBuilder()
                        .setCustomId(`userisntBotBtn_${targetMember.id}`)
                        .setLabel("Enlever la mise en quarantaine")
                        .setStyle(ButtonStyle.Secondary);

                    const btnRow = new ActionRowBuilder().addComponents(confirmUserIsABot, cancelUserIsABot);

                    await channelToSendLog.send({ content: `<@&1299068940689080341>`, embeds: [susUserEmbed], components: [btnRow] });
                }
            } catch (err) {
                // Erreur lors de l'envoi de l'embed de notification
            }
        }
    }
}

// Commande send
async function handleRSCommand(message, rsPrefix) {
    const args = message.content.slice(rsPrefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'tracker') {
        try {
            const link = args[0];

            if (link.startsWith("https://www.twitch.tv/") || link.startsWith("https://twitch.tv/") || 
                link.startsWith("https://discord.gg/") || link.startsWith("https://discord.com/invite/")) {
                const channelToSend = message.channel;

                channelToSend.send(`Voici le lien de votre tracker:\n${link}`);
            } else if (link.startsWith("https://www.pornhub.com/") || link.startsWith("https://fr.pornhub.com/") || link.startsWith("https://www.xnxx.com/") || link.startsWith("https://www.xnxx2.com/") || link.startsWith("https://rule34.xxx/")) {
                const authorMember = message.member;
                const memberToTO = `<@${authorMember.id}>`;

                const reason = "Essaye de contourner la censure de liens pornographiques avec le bot.";
                const time = 1000 * 60 * 60 * 2;
                const channelToSend = message.channel;
                await authorMember.timeout(time, reason);
                await channelToSend.send({ content: `${memberToTO}, vous avez reçu un timeout de 2h pour avoir essayé de contourner la censure de liens pornographiques.` });
            } else {
                const authorMember = message.member;
                const memberToTO = `<@${authorMember.id}>`;

                const reason = "Essaye de contourner la censure de liens avec le bot.";
                const time = 1000 * 60 * 60 * 1;
                const channelToSend = message.channel;
                await authorMember.timeout(time, reason);
                await channelToSend.send({ content: `${memberToTO}, vous avez reçu un timeout de 1h pour avoir essayé de contourner la censure de liens.` });
            }
        } catch (err) {
            // Erreur lors de l'exécution de la commande sendTracker
        }
    }
}

// Gestionnaire pour les interactions de boutons
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    const [action, userId] = interaction.customId.split('_');

    if (action === 'userisBotBtn') {
        try {
            const member = interaction.guild.members.cache.get(userId);
            if (member) {
                // Bannir l'utilisateur
                await member.ban({ reason: "Banni par un membre du staff après suspicion d'être un bot." });

                // Supprimer le message d'interaction
                await interaction.message.delete();

                // Log du bannissement
                const logChannel = interaction.guild.channels.cache.get("1299069255949746246"); // Remplacez par l'ID du salon de logs
                if (logChannel) {
                    await logChannel.send({ content: `L'utilisateur ${member.user.username} a été banni par ${interaction.user.username}.` });
                }
            }
        } catch (err) {
            console.error("Erreur lors du bannissement de l'utilisateur:", err);
        }
    } else if (action === 'userisntBotBtn') {
        try {
            const member = interaction.guild.members.cache.get(userId);
            if (member) {
                // Suppression du rôle de mise en quarantaine et ajout du rôle de membre
                await member.roles.remove(utilisateurSuspect);
                await member.roles.add(membreRole);

                // Vérification et levée de l'exclusion (timeout)
                if (member.communicationDisabledUntilTimestamp !== null) {
                    await member.timeout(null);
                }

                // Supprimer le message d'interaction
                await interaction.message.delete();

                // Log de la levée de la mise en quarantaine
                const logChannel = interaction.guild.channels.cache.get("1299069255949746246"); // Remplacez par l'ID du salon de logs
                if (logChannel) {
                    await logChannel.send({ content: `La mise en quarantaine de ${member.user.username} a été levée par ${interaction.user.username}.` });
                }
            } else {
                console.error("Membre non trouvé dans le cache de la guilde.");
            }
        } catch (err) {
            console.error("Erreur lors de la levée de la mise en quarantaine:", err);
        }
    }
});

// Commande MTC
async function handleMtcCommand(message, mtcPrefix) {
    const args = message.content.slice(mtcPrefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'commandName') {
        // Implémenter la logique de la commande MTC
    }
}
