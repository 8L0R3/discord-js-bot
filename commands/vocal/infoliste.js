const { SlashCommandBuilder } = require('@discordjs/builders');
const { waitingList } = require('./index');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('infoliste')
        .setDescription('Affiche la liste des personnes en attente dans l\'ordre.'),
    async execute(interaction) {
        if (waitingList.length === 0) {
            return interaction.reply('La liste d\'attente est vide.');
        }

        const list = await Promise.all(waitingList.map(async id => {
            const member = await interaction.guild.members.fetch(id);
            return member.user.tag;
        }));

        return interaction.reply(`Liste d'attente :\n${list.join('\n')}`);
    }
};
