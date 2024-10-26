const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');
const { token, vocalChannelId, textChannelId, roleId, authorizedRoleId, musicFolder } = require("./config.json");
const { db } = require("./events/connectDB");
const cron = require('node-cron');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildModeration
  ],
});

module.exports = { client };

client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

// Chargement des événements
const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Chargement des commandes
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

/* ----------------------------------------------------------------------------------------------------------------------------------------------------
												Importez le système de gestion des statuts personnalisés
 ----------------------------------------------------------------------------------------------------------------------------------------------------*/

const setupCustomStatusRole = require('./events/customStatusRole.js');
setupCustomStatusRole(client);

/* ----------------------------------------------------------------------------------------------------------------------------------------------------
												                Gestion Liste d'attente
 ----------------------------------------------------------------------------------------------------------------------------------------------------*/

client.on('voiceStateUpdate', (oldState, newState) => {
  const vocalHandler = require('./commands/vocal/index.js');
  vocalHandler.handleVoiceUpdate(oldState, newState, client);
});

/* ----------------------------------------------------------------------------------------------------------------------------------------------------
												              Gestion Ping Staff joueur en attente d'aide
 ----------------------------------------------------------------------------------------------------------------------------------------------------*/

const joinedAndLeft = new Map();
const maxActions = 5;
const timeWindow = 30 * 60 * 1000;
const quarantineTime = 1000 * 60 * 60 * 5;
const utilisateurSuspectRoleID = '1299068966764810344';
const membreRoleID = '1299068953435312279';

client.on("voiceStateUpdate", async (oldState, newState) => {
  const guild = newState.guild;
  const member = newState.member;

  if (member.roles.cache.has(authorizedRoleId, membreRoleID)) {
    return;
  }

  if (newState.channelId === vocalChannelId) {
    const textChannel = guild.channels.cache.get(textChannelId);
    const role = guild.roles.cache.get(roleId);

    if (joinedAndLeft.has(member.id)) {
      const userData = joinedAndLeft.get(member.id);
      userData.actions = userData.actions.filter(action => Date.now() - action < timeWindow);

      if (userData.actions.length >= maxActions) {
        textChannel.send(`${role} **${member.toString()}** a été exclu pour comportement de spam dans le canal vocal.`);
        try {
          await member.voice.disconnect();
        } catch (error) {
          console.error(`Erreur lors de l'expulsion du membre : ${error}`);
        }

        joinedAndLeft.delete(member.id);

        try {
          await member.roles.add(utilisateurSuspectRoleID);
          await member.roles.remove(membreRoleID);
          const reason = "Utilisateur suspecté d'être un bot";
          await member.timeout(quarantineTime, reason);
          await sendQuarantineNotification(member, guild, role);
        } catch (err) {
          console.error(`Erreur lors de l'application du rôle de quarantaine ou du timeout : ${err}`);
        }

        return;
      } else {
        textChannel.send(`${role} **${member.toString()}** entre et sort fréquemment. Veuillez respecter les règles du canal.`);
        userData.actions.push(Date.now());
      }
    } else {
      textChannel.send(`${role} **${member.toString()}** est actuellement en attente d'aide.`);
      joinedAndLeft.set(member.id, { actions: [Date.now()] });
    }
  }
});

async function sendQuarantineNotification(member, guild, role) {
  const channelToSendLog = guild.channels.cache.get("1299069255949746246");

  const susUserEmbed = new EmbedBuilder()
    .setColor("Red")
    .setTitle(`${member.toString()} est suspecté d'être un bot.`)
    .setDescription(`Le membre a été mis en quarantaine pour comportement suspect dans le canal vocal.`)
    .addFields(
      { name: 'Membre:', value: `<@${member.id}>` },
      { name: 'Raison:', value: `Spamming dans le canal vocal` },
      { name: 'Durée de la quarantaine:', value: `5 heures` }
    )
    .setThumbnail(member.user.displayAvatarURL());

  const cancelUserIsABot = new ButtonBuilder()
    .setCustomId(`userisntBotBtn_${member.id}`)
    .setLabel("Enlever la mise en quarantaine")
    .setStyle(ButtonStyle.Secondary);

  const btnRow = new ActionRowBuilder()
    .addComponents(cancelUserIsABot);

  await channelToSendLog.send({ content: `<@&1299068940689080341>`, embeds: [susUserEmbed], components: [btnRow] });
}

/* ----------------------------------------------------------------------------------------------------------------------------------------------------
												                    Anti spam salon entreprise
 ----------------------------------------------------------------------------------------------------------------------------------------------------*/

const userCooldowns = new Map();
const specificChannelId = "1299069051171246151";
const specialRoleId = "1299068953435312279";
const messageCooldownDuration = 24 * 60 * 60 * 1000;

client.on("messageCreate", (message) => {
  if (!message.author.bot && message.channel.id === specificChannelId) {
    const authorId = message.author.id;
    const member = message.guild.members.cache.get(authorId);

    // Vérifiez si le membre a le rôle spécial
    if (member && member.roles.cache.has(specialRoleId)) {
      return; // Exclure le membre de l'anti-spam
    }

    if (userCooldowns.has(authorId)) {
      const cooldownExpiration = userCooldowns.get(authorId);
      const now = new Date();

      if (now < cooldownExpiration) {
        const cooldownEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("SunLife | Anti-Spam | Publicité")
          .setDescription(`
            Désolé, ${message.author},
            vous ne pouvez pas envoyer de nouveaux messages pour les prochaines 24 heures.

            ⥋▹📕 Merci de lire notre <#1259561960039780373>
            ⥋▹📣 Envoyez vos publicités toutes les 24 heures
            ⥋▹⬅️ Si vous quittez, vos messages seront supprimés`);

        message.channel
          .send({ embeds: [cooldownEmbed] })
          .then(sentMessage => {
            setTimeout(() => sentMessage.delete(), 10000);
          });

        message.delete();
        return;
      }
    }

    userCooldowns.set(authorId, new Date(Date.now() + messageCooldownDuration));
  }
});

/* ----------------------------------------------------------------------------------------------------------------------------------------------------
										          Bot join vocal attente aide pour passer de la music
# ----------------------------------------------------------------------------------------------------------------------------------------------------*/

const ffmpegPath = path.join(__dirname, 'node_modules', 'ffmpeg', 'bin', 'ffmpeg.exe');

let botShouldJoin = true;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  if (newState.channelId === vocalChannelId && botShouldJoin) {
    const channel = await client.channels.fetch(vocalChannelId);
    if (!channel) return;

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    connection.setMaxListeners(20);

    connection.on(VoiceConnectionStatus.Ready, () => {
      playMusic(connection);
    });

    connection.on('error', (error) => {
    });
  }

  if (oldState.channelId === vocalChannelId && newState.channelId !== vocalChannelId) {
    setTimeout(async () => {
      const channel = await client.channels.fetch(vocalChannelId);
      if (channel && channel.members.size === 1) {
        const connection = getVoiceConnection(channel.guild.id);
        if (connection) {
          botShouldJoin = false;
          connection.destroy();
          setTimeout(() => {
            botShouldJoin = true;
          }, 10000); // Définir un délai avant que le bot puisse se reconnecter
        }
      }
    }, 5000);
  }
});

function playMusic(connection) {
  const player = createAudioPlayer();

  try {
    const files = fs.readdirSync(musicFolder);

    if (files.length === 0) {
      return;
    }

    const randomFile = files[Math.floor(Math.random() * files.length)];
    const resource = createAudioResource(path.join(musicFolder, randomFile));

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      playMusic(connection);
    });

    player.on('error', (error) => {
      playMusic(connection);
    });
  } catch (error) {
  }
}

 /*----------------------------------------------------------------------------------------------------------------------------------------------------
								          Suppression tout les 5h du matin des messages dans le salon live twitch/tiktok
 ----------------------------------------------------------------------------------------------------------------------------------------------------*/

const specificChannelIds = [
  { id: "1299069052819341484", messageId: "1268420051841585195" }, // ID du premier salon avec le message spécifique
  { id: "1299069060033810432", messageId: "1268422162730192937" }  // ID du deuxième salon avec le message spécifique
];

client.once('ready', () => {

  cron.schedule('0 3 * * *', async () => { // Planifié pour s'exécuter à 3h00 chaque jour
      fs.appendFileSync('cron_test.log', `Tâche cron démarrée à ${new Date()}\n`);
      
      for (const { id: channelId, messageId: specificMessageId } of specificChannelIds) {
          try {
              const channel = await client.channels.fetch(channelId);
              if (channel && channel.isTextBased()) {
                  fs.appendFileSync('cron_test.log', `Suppression des messages dans le salon ${channelId}\n`);
                  let messages;
                  do {
                      messages = await channel.messages.fetch({ limit: 100 });
                      const messagesToDelete = messages.filter(msg => msg.id !== specificMessageId);
                      await channel.bulkDelete(messagesToDelete);
                      fs.appendFileSync('cron_test.log', `Supprimé ${messagesToDelete.size} messages dans le salon ${channelId}\n`);
                  } while (messages.size >= 2); // Fetch again if there are more messages to delete
                  fs.appendFileSync('cron_test.log', `Les messages du salon ${channelId} ont été supprimés.\n`);
              } else {
                  fs.appendFileSync('cron_test.log', `Le salon ${channelId} n'a pas été trouvé ou n'est pas textuel.\n`);
              }
          } catch (error) {
              fs.appendFileSync('cron_test.log', `Erreur lors de la suppression des messages dans le salon ${channelId} : ${error}\n`);
          }
      }
  });
});

client.login(token);

// Assurez-vous de gérer les erreurs non gérées
process.on('unhandledRejection', error => {
});
