module.exports = {
    name: 'shuffle',
    description: 'Shuffles queue.',
    aliases: ['sh'],
    cooldown: 5,
    category: 'music',
    execute(message, queue){
        const serverQueue = queue.get(message.guild.id);

        if(!message.guild.me.voice.channel)
            return message.channel.send(`⚠️ **${message.client.user.username}** is not connected to a voice channel.`);

        if(message.member.voice.channel != message.guild.me.voice.channel)
            return message.channel.send(`🚫 You need to be in **${message.guild.me.voice.channel.name}** to use this command!`);

        if(!serverQueue || !serverQueue.songs.length) return message.channel.send("⚠️ Music queue is empty.");

        let songs = serverQueue.songs;
        for(let i = songs.length - 1; i > 1; i--){
            let j = 1 + Math.floor(Math.random() * i);
            [songs[i], songs[j]] = [songs[j], songs[i]];
        }
        serverQueue.songs = songs;
        message.channel.send(`🔀 ${message.author.username} shuffled the queue.`);
    }
}