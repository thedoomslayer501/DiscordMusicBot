const { timeFormat } = require('../util/functions.js');
const Discord = require('discord.js');
const progressbar = require('string-progressbar');

module.exports = {
    name: 'nowplaying',
    description: 'Displays currently playing song.',
    aliases: ['np', 'playing'],
    category: 'music',
	execute(message, queue){
        const serverQueue = queue.get(message.guild.id);

        if(!message.guild.me.voice.channel)
            return message.channel.send(`⚠️ **${message.client.user.username}** is not connected to a voice channel.`);

        if(message.member.voice.channel != message.guild.me.voice.channel)
            return message.channel.send(`🚫 you need to be in **${message.guild.me.voice.channel.name}** to use this command!`);

        if(!serverQueue || !serverQueue.songs.length) return message.channel.send("⚠️ Music queue is empty.");

        const total = serverQueue.songs[0].duration;
        const current = (serverQueue.connection.dispatcher.streamTime - serverQueue.connection.dispatcher.pausedTime) / 1000;
        const left = serverQueue.songs[0].duration - current;

        const embed = new Discord.MessageEmbed()
            .setColor('#d84d77')
            .setTitle("🎵 Now Playing")
            .setThumbnail(`${serverQueue.songs[0].thumbnail}`)
            .setDescription(`[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})`)
            .addField("Song Duration", `\`${serverQueue.songs[0].vlength}\``, true)
            .setFooter(`Requested by ${serverQueue.songs[0].requester.username}`)
            .setTimestamp();
        if(serverQueue.songs[0].vlength != "🔴LIVE"){
            embed.addFields(
                { name: "Time Remaining", value: `\`${timeFormat(left)}\``, inline: true },
                { name: "Progress Bar", value: `\`${timeFormat(current)}\`[${progressbar.splitBar(total, current, size = 20)[0]}]\`${timeFormat(total)}\``}
            );
        }
        message.channel.send(embed);
	}
}