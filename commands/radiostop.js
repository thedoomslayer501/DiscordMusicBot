module.exports = {
    name: 'radiostop',
    description: 'Turns off the radio.',
    aliases: ['stopradio'],
    category: 'music',
    execute(message, queue){
        const serverQueue = queue.get(message.guild.id);

        if((message.member.voice.channel != message.guild.me.voice.channel) && message.guild.me.voice.channel)
            return message.channel.send(`🚫 You need to be in **${message.guild.me.voice.channel.name}** to use this command!`);

        if(!message.guild.radio || !message.guild.radio.isPlaying) message.channel.send("⚠️ The radio is already off.");
        else{
            const playingSong = serverQueue.songs[0];
            message.guild.radio = null;
            serverQueue.station = null;
            serverQueue.addIndex = 0;
            serverQueue.songs = serverQueue.songs.filter(song => song.requester.id != message.client.user.id);
            if(playingSong.requester.id === message.client.user.id){
                serverQueue.songs.unshift(playingSong);
                serverQueue.connection.dispatcher.end();
            }
            message.channel.send(`📻 **${message.author.username}** has turned off the radio.`);
        }
    }
}
