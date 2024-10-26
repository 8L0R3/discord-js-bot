const client = require ('../index');
const { Collection } = require('discord.js');
const voiceCollection = new Collection();


// client.on("voiceStateUpdate", async (oldState, newState) => {
//     const user = await client.users.fetch(newState.id);
//     const member = newState.guild.member(user);

//     if(!oldState.channel && newState.channel.id === '1103766959943856184') {
//         const channel = await newState.guild.channels.create(user.tag, {
//             type: 'GUILD_VOICE',
//             parent: newState.channel.parent,
//         });
//         member.voice.setChannel(channel);
//         voiceCollection.set(user.id, channel.id);
//     } else if(!newState.channel) {
//         if(oldState.channelId === voiceCollection.get(newState.id)) return oldState.channel.delete()
//     }
// });