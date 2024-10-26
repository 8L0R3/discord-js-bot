const { Events } = require("discord.js");
const { ActivityType } = require("discord.js");
const { connectToMysql } = require("./connectDB");

// Remplacez ceci par l'identifiant de votre serveur principal
const PRINCIPAL_SERVER_ID = '1259473917219962900';

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        await connectToMysql();
        client.slashs = client.commands.size;

        // Function to update the bot's presence with the member count
        const updatePresence = () => {
            const guild = client.guilds.cache.get(PRINCIPAL_SERVER_ID);

            if (guild) {
                const memberCount = guild.memberCount;
                client.user.setPresence({
                    activities: [
                        {
                            name: `SunLife - ${memberCount} membres`,
                            url: "https://www.twitch.tv/sunlifesw_officiel",
                            type: ActivityType.Streaming,
                        },
                    ],
                    status: "online",
                });
            } else {
                console.log("Impossible de récupérer le nombre de membres.");
            }
        };

        // Initial presence update
        updatePresence();

        // Update the presence every 5 minutes (300000 milliseconds)
        setInterval(updatePresence, 300000);

        console.log(`╔═[${client.user.tag}]: je suis connecté ═╗\n╠J'ai correctement chargé ${client.slashs} commandes           ║							 				\n╚════════════════════════════════════════════════╝`);
    }
};

