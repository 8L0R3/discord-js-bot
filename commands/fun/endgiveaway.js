const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('endgiveaway')
        .setDescription('Met fin au giveaway actif')
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('L\'ID du message du giveaway')
                .setRequired(true)),

    async execute(interaction) {
        const messageId = interaction.options.getString('messageid');
        const channel = interaction.channel;

        try {
            const message = await channel.messages.fetch(messageId);
            const reactions = message.reactions.cache.get('🎉');

            if (!reactions) {
                return interaction.reply('Aucune réaction trouvée pour ce giveaway.');
            }

            const users = await reactions.users.fetch();
            const winnersCount = 1; // Vous pouvez également ajouter cette option en tant qu'option de commande

            const winners = users.filter(user => !user.bot).random(winnersCount);

            if (winners.size === 0) {
                return interaction.reply('Aucun gagnant n\'a été trouvé.');
            }

            winners.forEach(async (winner) => {
                // Création de l'embed
                const winnerEmbed = new EmbedBuilder()
                    .setTitle('🎉 Félicitations ! 🎉')
                    .setDescription(`Bravo ${winner} !\n\nVous avez gagné **le giveaway** ! 🎁\n\nPour récupérer votre récompense, veuillez créer un ticket dans le salon approprié.`)
                    .setColor('#FFD700')
                    .setThumbnail(interaction.guild.iconURL())
                    .setFooter({ text: 'Merci d\'avoir participé au giveaway !' })
                    .setTimestamp();

                // Envoi du message en MP
                try {
                    await winner.send({ embeds: [winnerEmbed] });
                } catch (error) {
                    console.error(`Impossible d'envoyer un MP à ${winner.tag}.`);
                }

                // Envoi du message dans le salon du giveaway
                await channel.send({ content: `${winner}`, embeds: [winnerEmbed] });
            });

            interaction.reply(`Le giveaway est terminé ! Félicitations aux gagnants : ${winners.map(winner => winner.username).join(', ')} !`);
        } catch (error) {
            console.error(error);
            interaction.reply('Une erreur s\'est produite en essayant de mettre fin au giveaway.');
        }
    },
};
