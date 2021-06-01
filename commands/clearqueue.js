module.exports = {
    name: 'clearqueue',
    description: 'Removes user requested songs from queue.',
    aliases: ['clear'],
    cooldown: 5,
    category: 'music',
    execute(message, queue){
        const serverQueue = queue.get(message.guild.id);

        if(!message.guild.me.voice.channel)
            return message.channel.send(`⚠️ **${message.client.user.username}** is not connected to a voice channel.`);

        if(message.member.voice.channel != message.guild.me.voice.channel)
            return message.channel.send(`🚫 You need to be in **${message.guild.me.voice.channel.name}** to use this command!`);

        if(!serverQueue || !serverQueue.songs.length) return message.channel.send("⚠️ Music queue is empty.");

        const playingSong = serverQueue.songs[0];

        if(message.guild.radio && message.guild.radio.isPlaying){
            serverQueue.songs = serverQueue.songs.filter(song => song.requester.id === message.client.user.id);
            serverQueue.addIndex = 0;
            message.channel.send("💥 Cleared user requested songs from queue.");
        }
        else{
            serverQueue.songs = [];
            message.channel.send("💥 Queue cleared.");
        }
        
        if(playingSong.requester.id != message.client.user.id) serverQueue.songs.unshift(playingSong);
    }
}