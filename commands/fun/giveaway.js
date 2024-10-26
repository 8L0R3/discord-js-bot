const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Lance un giveaway')
        .addStringOption(option =>
            option.setName('prix')
                .setDescription('Le prix du giveaway')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duree')
                .setDescription('Durée du giveaway en minutes')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('gagnants')
                .setDescription('Nombre de gagnants')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Canal où l\'embed sera envoyé')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Rôle à gagner')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('specialrole')
                .setDescription('Rôle spécial requis pour participer')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('mention')
                .setDescription('Mentionner un rôle ou @everyone')
                .addChoices(
                    { name: 'Mentionner tout le monde', value: '@everyone' },
                    { name: 'Mentionner un rôle', value: 'role' }
                )
                .setRequired(false)),

    async execute(interaction) {
        const prize = interaction.options.getString('prix');
        const duration = interaction.options.getInteger('duree') * 60 * 1000;
        const winnersCount = interaction.options.getInteger('gagnants');
        const channelId = interaction.options.getChannel('channel').id;
        const roleId = interaction.options.getRole('role')?.id;
        const specialRoleId = interaction.options.getRole('specialrole')?.id;
        const mention = interaction.options.getString('mention');
        
        const channel = interaction.client.channels.cache.get(channelId);

        if (!channel) {
            return interaction.reply('Le canal spécifié n\'existe pas.');
        }

        let mentionText = '';
        if (mention === '@everyone') {
            mentionText = '@everyone';
        } else if (mention === 'role' && roleId) {
            mentionText = `<@&${roleId}>`;
        }

        const embed = new EmbedBuilder()
            .setTitle('🎉 Giveaway 🎉')
            .setDescription(`**Prix :** ${prize}\n**Réagissez avec 🎉 pour participer !**`)
            .setFooter({ text: `Le giveaway se termine dans ${interaction.options.getInteger('duree')} minutes.` })
            .setTimestamp();

        if (roleId) {
            embed.addFields({ name: 'Rôle à gagner', value: `<@&${roleId}>` });
        }

        if (specialRoleId) {
            embed.addFields({ name: 'Rôle spécial requis', value: `<@&${specialRoleId}>` });
        }

        const message = await channel.send({
            content: mentionText,
            embeds: [embed],
        });

        await message.react('🎉');

        const collector = message.createReactionCollector({ time: duration });

        collector.on('collect', async (reaction, user) => {
            if (reaction.emoji.name === '🎉' && !user.bot) {
                try {
                    await user.send(`Vous avez participé au giveaway pour **${prize}** ! Bonne chance !`);
                } catch (error) {
                    console.error(`Impossible d'envoyer un MP à ${user.tag}.`);
                }
            }
        });

        collector.on('end', async () => {
            // Désactivation des réactions pour ce message
            await message.reactions.removeAll();

            const fetchedMessage = await channel.messages.fetch(message.id);
            const reactions = fetchedMessage.reactions.cache.get('🎉');
            if (reactions) {
                const users = await reactions.users.fetch();
                const eligibleUsers = users.filter(user => !user.bot);
                let winners;

                if (specialRoleId) {
                    const specialRoleMembers = await interaction.guild.roles.fetch(specialRoleId);
                    const specialRoleUsers = specialRoleMembers.members;
                    winners = eligibleUsers.filter(user => specialRoleUsers.has(user.id)).random(winnersCount);
                } else {
                    winners = eligibleUsers.random(winnersCount);
                }

                if (winners.size === 0) {
                    return interaction.followUp('Aucun gagnant n\'a été trouvé.');
                }

                winners.forEach(async (winner) => {
                    const winnerEmbed = new EmbedBuilder()
                        .setTitle('🎉 Félicitations ! 🎉')
                        .setDescription(`Bravo ${winner} !\n\nVous avez gagné **${prize}** ! 🎁\n\nPour récupérer votre récompense, veuillez créer un ticket dans le salon approprié.`)
                        .setColor('#FFD700')
                        .setThumbnail(interaction.guild.iconURL())
                        .setFooter({ text: 'Merci d\'avoir participé au giveaway !' })
                        .setTimestamp();

                    try {
                        await winner.send({ embeds: [winnerEmbed] });
                    } catch (error) {
                        console.error(`Impossible d'envoyer un MP à ${winner.tag}.`);
                    }

                    await channel.send({ content: `${winner}`, embeds: [winnerEmbed] });
                });

                interaction.followUp(`Le giveaway est terminé ! Félicitations aux gagnants : ${winners.map(winner => winner.username).join(', ')} !`);
            }
        });
    },
};
