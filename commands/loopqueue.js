module.exports = {
    name: 'loopqueue',
    description: 'Toggles looping for the whole queue.',
    aliases: ['loopall', 'loopq'],
    category: 'music',
    execute(message, queue){
        const serverQueue = queue.get(message.guild.id);

        if(!message.guild.me.voice.channel)
            return message.channel.send(`ā ļø **${message.client.user.username}** is not connected to a voice channel.`);
        
        if(message.member.voice.channel != message.guild.me.voice.channel)
            return message.channel.send(`š« You need to be in **${message.guild.me.voice.channel.name}** to use this command!`);

        if(!serverQueue || !serverQueue.songs.length) return message.channel.send("ā ļø Music queue is empty.");

        if(message.guild.radio && message.guild.radio.isPlaying) return message.channel.send("ā ļø Cannot turn on Queue Loop while radio is on.");

        serverQueue.loopQueue = !serverQueue.loopQueue;

        if(serverQueue.loopSong){
            serverQueue.loopSong = false;
            message.channel.send("ā Song Loop turned off.\nš Queue Loop turned on.");
        }
        else if(serverQueue.loopQueue && !serverQueue.loopSong){
            message.channel.send("š Queue Loop turned on.");
        }
        else{
            message.channel.send("ā Queue Loop turned off.");
        }
    }
}