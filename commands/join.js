module.exports = {
    name: 'join',
    description: 'Connects the bot to a voice channel.',
    aliases: ['summon', 'connect'],
    category: 'music',
    async execute(message, queue){
        const serverQueue = queue.get(message.guild.id);

        if(!message.member.voice.channel) return message.channel.send("⚠️ Please join a voice channel first.");

        if((serverQueue && serverQueue.isPlaying) && message.guild.me.voice.channel)
            message.channel.send(`⚠️ **${message.client.user.username}** is already connected to voice channel **${message.guild.me.voice.channel.name}**.`);
        else{
            await message.member.voice.channel.join();
            await message.guild.me.voice.setSelfDeaf(true);
            message.channel.send(`🔊 Joined voice channel **${message.member.voice.channel.name}**.`);
        }
    }
}