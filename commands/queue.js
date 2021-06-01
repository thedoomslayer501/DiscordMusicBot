const { timeFormat } = require('../util/functions.js');
const Discord = require('discord.js');

module.exports = {
    name: 'queue',
    aliases: ['q'],
    description: 'Displays the current queue.',
    category: 'music',
    async execute(message, queue){
        const serverQueue = queue.get(message.guild.id);

        if(!message.guild.me.voice.channel)
            return message.channel.send(`⚠️ **${message.client.user.username}** is not connected to a voice channel.`);

        if(message.member.voice.channel != message.guild.me.voice.channel)
            return message.channel.send(`🚫 You need to be in **${message.guild.me.voice.channel.name}** to use this command!`);

        if(!serverQueue || !serverQueue.songs.length) return message.channel.send("⚠️ Music queue is empty.");

        const embed = new Discord.MessageEmbed()
            .setColor('#d84d77')
            .setTitle(`🎶 Music Queue for ${message.guild.name}`)
            .setThumbnail(serverQueue.songs[0].thumbnail)
            .setTimestamp();

        if(!serverQueue.songs[1]){
            embed.addField("__Now Playing:__", `[${serverQueue.songs[0].title}](${serverQueue.songs[0].url}) \`[${serverQueue.songs[0].vlength}]\``)
                .setFooter(`Requested by ${serverQueue.songs[0].requester.username}`);
            if(serverQueue.station) embed.addField("Station", `\`${serverQueue.station}\``);
            return message.channel.send(embed);
        }

        let currentPage = 0;
        const embeds = embedGenerator(serverQueue, message);
    
        const queueEmbed = await message.channel.send(embeds[currentPage]);
        await queueEmbed.react('⬅️');
        await queueEmbed.react('➡️');
    
        const reactionFilter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && (message.author.id === user.id);
        const collector = queueEmbed.createReactionCollector(reactionFilter);
    
        collector.on('collect', (reaction, user) => {
            if(reaction.emoji.name === '➡️'){
                if(currentPage < embeds.length - 1){
                    currentPage += 1;
                    queueEmbed.edit(embeds[currentPage]);
                    message.reactions.resolve(reaction).users.remove(user);
                }
            }
            else if(reaction.emoji.name === '⬅️'){
                if(currentPage != 0){
                    currentPage -= 1;
                    queueEmbed.edit(embeds[currentPage]);
                    message.reactions.resolve(reaction).users.remove(user);
                }
            }
        })
        setTimeout(() => collector.stop(), 300000);
    }
}

function embedGenerator(serverQueue, message){
    const embeds = [];
    const totalPages = Math.ceil((serverQueue.songs.length - 1) / 10);
    let songs = 11;

    let queueDuration = parseInt(serverQueue.songs[1].duration);
    for(let i = 1; i < serverQueue.songs.length - 1; i++) queueDuration += parseInt(serverQueue.songs[i + 1].duration);
    
    for(let i = 1; i < serverQueue.songs.length; i += 10){
        const current = serverQueue.songs.slice(i, songs);
        songs += 10;
        let j = i - 1;
        const info = current.map(song => `\`${++j}\`. [${song.title}](${song.url}) \`${song.vlength}\``).join('\n');
        const embed = new Discord.MessageEmbed()
            .setDescription(`**__Now Playing:__**\n[${serverQueue.songs[0].title}](${serverQueue.songs[0].url}) \`[${serverQueue.songs[0].vlength}]\`\n**__Up Next:__**\n${info}`)
            .setColor('#d84d77')
            .setTitle(`🎶 Music Queue for ${message.guild.name}`)
            .setThumbnail(serverQueue.songs[0].thumbnail)
            .setFooter(`Queue Page: ${embeds.length + 1}/${totalPages}`)
            .setTimestamp()
            .addFields(
                { name: "Entries", value: `\`${serverQueue.songs.length - 1}\``, inline: true },
                { name: "Queue Duration", value: `\`${timeFormat(queueDuration)}\``, inline: true }
            );
        if(serverQueue.station) embed.addField("Station", `\`${serverQueue.station}\``, true);
        if(serverQueue.loopSong) embed.addField("Repeating", "\`Song\`", true);
        if(serverQueue.loopQueue) embed.addField("Repeating", "\`Queue\`", true);
        embeds.push(embed);
    }
    return embeds;
}