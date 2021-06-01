const Discord = require('discord.js');

module.exports = {
    name: 'remove',
    description: 'Removes a song from queue.',
    aliases: ['del', 'delete'],
    usage: '[index number]',
    category: 'music',
	execute(message, queue, args){
        const serverQueue = queue.get(message.guild.id);

        const embed = new Discord.MessageEmbed()
            .setTitle("Song Removed")
            .setFooter(`Removed by ${message.author.username}`)
            .setTimestamp()
            .setColor('#d84d77');

        if(!message.guild.me.voice.channel)
            return message.channel.send(`⚠️ **${message.client.user.username}** is not connected to a voice channel.`);
        
        if(message.member.voice.channel != message.guild.me.voice.channel)
            return message.channel.send(`🚫 You need to be in **${message.guild.me.voice.channel.name}** to use this command!`);

        if(!serverQueue || !serverQueue.songs.length) return message.channel.send("⚠️ Music queue is empty.");

        if (!args.length) return message.channel.send("⚠️ Please enter a song index.");

        let index = parseInt(args[0]);

        if(!serverQueue.songs[index]) return message.channel.send(`⚠️ There is no song at position **${index}**`);

        let song = serverQueue.songs[index];
        
        if(index != 0){
            serverQueue.songs.splice(index, 1);
            embed.setDescription(`❌ [${song.title}](${song.url}) \`[${song.vlength}]\` has been removed from queue.`);
            message.channel.send(embed);
        }
        else{
            message.channel.send(`⚠️ Number entered should be ≥ 1 and ≤ ${serverQueue.songs.length - 1}.`);
        }
	}
}