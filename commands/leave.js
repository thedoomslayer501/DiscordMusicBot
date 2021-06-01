module.exports = {
    name: 'leave',
    description: 'Disconnects the bot from voice channel.',
    aliases: ['dc', 'disconnect'],
    category: 'music',
    execute(message){
        if(!message.guild.me.voice.channel)
            return message.channel.send(`⚠️ **${message.client.user.username}** is not connected to a voice channel.`);

        if(message.member.voice.channel != message.guild.me.voice.channel)
            return message.channel.send(`🚫 You need to be in **${message.guild.me.voice.channel.name}** to use this command!`);

        message.guild.me.voice.channel.leave();
        message.channel.send("👋 Disconnected from voice channel.");
    }
}