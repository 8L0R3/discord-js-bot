const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

// Configuration
const SEUIL_JOIN = 5;  // Nombre de membres
const FENETRE_TEMPORELLE = 60 * 1000;  // Temps en millisecondes
const TEMPS_QUARANTAINE = 1000 * 60 * 60 * 5;  // 5 heures en millisecondes
const ROLE_UTILISATEUR_SUSPECT_ID = '1299068966764810344';
const ROLE_MEMBRE_ID = '1299068953435312279';
const LOG_CHANNEL_ID = '1299069252954751016';  // ID du canal de log
const ROLE_ADMIN_ID = '1259570438728716339';  // ID du rôle admin

// Stockage des timestamps de jointure des membres
const tempsDeJointure = new Map();

module.exports = (client) => {
    client.on('guildMemberAdd', membre => {
        const guildId = membre.guild.id;
        const tempsActuel = Date.now();

        if (!tempsDeJointure.has(guildId)) {
            tempsDeJointure.set(guildId, []);
        }

        // Ajouter le timestamp actuel
        tempsDeJointure.get(guildId).push(tempsActuel);

        // Nettoyer les timestamps plus vieux que FENETRE_TEMPORELLE
        tempsDeJointure.set(guildId, tempsDeJointure.get(guildId).filter(timestamp => tempsActuel - timestamp < FENETRE_TEMPORELLE));

        // Si le nombre de jointures récentes dépasse le seuil, détecter un raid
        if (tempsDeJointure.get(guildId).length >= SEUIL_JOIN) {
            gererRaid(membre.guild, tempsDeJointure.get(guildId));
        }
    });

    async function gererRaid(guild, joinTimestamps) {
        const roleAdmin = guild.roles.cache.get(ROLE_ADMIN_ID);
        if (roleAdmin) {
            roleAdmin.members.forEach(admin => {
                admin.send(`Un possible raid détecté dans ${guild.name} !`);
            });
        }

        const membresAMettreEnQuarantaine = joinTimestamps.slice(0, SEUIL_JOIN).map(timestamp => {
            return guild.members.cache.find(m => m.joinedTimestamp === timestamp);
        }).filter(membre => membre !== undefined);

        for (let membre of membresAMettreEnQuarantaine) {
            try {
                const roleSuspect = guild.roles.cache.get(ROLE_UTILISATEUR_SUSPECT_ID);
                const roleMembre = guild.roles.cache.get(ROLE_MEMBRE_ID);

                if (!roleSuspect || !roleMembre) {
                    console.error("Un ou plusieurs rôles spécifiés n'ont pas été trouvés.");
                    continue;
                }

                await membre.roles.add(roleSuspect);
                await membre.roles.remove(roleMembre);
                const raison = "Utilisateur suspecté d'être un bot";
                await membre.timeout(TEMPS_QUARANTAINE, raison);
                await envoyerNotificationQuarantaine(membre, guild);
            } catch (err) {
                console.error(`Erreur lors de l'application du rôle de quarantaine ou du timeout : ${err}`);
            }
        }
    }

    async function envoyerNotificationQuarantaine(membre, guild) {
        const canalDeLog = guild.channels.cache.get(LOG_CHANNEL_ID);

        if (!canalDeLog) {
            console.error("Le canal de log spécifié n'a pas été trouvé.");
            return;
        }

        const susUserEmbed = new MessageEmbed()
            .setColor('RED')
            .setTitle(`Raid suspect détecté`)
            .setDescription(`Le membre suivant a été mis en quarantaine pour comportement suspect:`)
            .addField('Membre:', `<@${membre.id}>`)
            .setTimestamp();

        const boutonAnnulerQuarantaine = new MessageButton()
            .setCustomId('userisntBotBtn')
            .setLabel("Enlever la mise en quarantaine")
            .setStyle('SECONDARY');

        const ligneDeBoutons = new MessageActionRow()
            .addComponents(boutonAnnulerQuarantaine);

        await canalDeLog.send({ content: `<@&${ROLE_ADMIN_ID}>`, embeds: [susUserEmbed], components: [ligneDeBoutons] });
    }
};
