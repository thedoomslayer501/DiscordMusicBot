const arrayMove = require('array-move');
const Discord = require('discord.js');

module.exports = {
    name: 'move',
    aliases: ['m', 'mv'],
    description: 'Moves a song within the queue. If new position is not specified, the song will be moved to the top of the queue.',
    usage: '[oldPosition] [newPosition]',
    cooldown: 5,
    category: 'music',
    execute(message, queue, args){
        const serverQueue = queue.get(message.guild.id);
        const embed = new Discord.MessageEmbed()
            .setTitle("Song Moved")
            .setFooter(`Moved by ${message.author.username}`)
            .setTimestamp()
            .setColor('#d84d77');

        if(!message.guild.me.voice.channel)
            return message.channel.send(`⚠️ **${message.client.user.username}** is not connected to a voice channel.`);

        if(message.member.voice.channel != message.guild.me.voice.channel)
            return message.channel.send(`🚫 You need to be in **${message.guild.me.voice.channel.name}** to use this command!`);

        if(!args.length) return message.channel.send("⚠️ Please enter a song index.");

        if(!serverQueue || !serverQueue.songs.length) return message.channel.send("⚠️ Music queue is empty.");

        const index = parseInt(args[0]);

        if(!serverQueue.songs[index]) return message.channel.send(`⚠️ There is no song at position **${index}**.`);

        const song = serverQueue.songs[index];

        if(!args[1] && index != 0){
            serverQueue.songs = arrayMove(serverQueue.songs, index, 1);
            embed.setDescription(`🚚 Moved [${song.title}](${song.url}) \`[${song.vlength}]\` to position **1**.`);
            message.channel.send(embed);
        }
        else if(args[1] != 0 && index != 0){
            if(args[1] >= serverQueue.songs.length) return message.channel.send(`⚠️ Position **${args[1]}** in the queue does not exist.`);
            serverQueue.songs = arrayMove(serverQueue.songs, index, parseInt(args[1]));
            embed.setDescription(`🚚 Moved [${song.title}](${song.url}) \`[${song.vlength}]\` to position **${args[1]}**.`);
            message.channel.send(embed);
        }
        else{
            message.channel.send(`⚠️ Numbers entered should be ≥ 1 and ≤ ${serverQueue.songs.length - 1} for **Old Position** and **New Position** of song.\nIf new position is not specified, the song will be moved to the top of the queue.`);
        }
    }
}