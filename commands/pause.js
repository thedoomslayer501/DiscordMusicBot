module.exports = {
    name: 'pause',
    description: 'Pauses the music player.',
    aliases: ['ps'],
    category: 'music',
    execute(message, queue){
        const serverQueue = queue.get(message.guild.id);

        if(!message.guild.me.voice.channel)
            return message.channel.send(`⚠️ **${message.client.user.username}** is not connected to a voice channel.`);

        if(message.member.voice.channel != message.guild.me.voice.channel)
            return message.channel.send(`🚫 You need to be in **${message.guild.me.voice.channel.name}** to use this command!`);

        if(!serverQueue || !serverQueue.songs.length) return message.channel.send("⚠️ Music queue is empty.");

        if(serverQueue.connection.dispatcher.paused)
            return message.channel.send("⚠️ The song is already paused.");

        serverQueue.connection.dispatcher.pause(true);
        message.channel.send("⏸️ Song paused.");
    }
}