module.exports = {
	name: 'skip',
    description: 'Skips current song.',
    aliases: ['sk'],
    category: 'music',
	execute(message, queue){
        const serverQueue = queue.get(message.guild.id);

        if(!message.guild.me.voice.channel)
            return message.channel.send(`⚠️ **${message.client.user.username}** is not connected to a voice channel.`);

        if(message.member.voice.channel != message.guild.me.voice.channel)
            return message.channel.send(`🚫 You need to be in **${message.guild.me.voice.channel.name}** to use this command!`);

        if(!serverQueue || !serverQueue.songs.length) return message.channel.send("⚠️ Music queue is empty.");

        let usersC = message.member.voice.channel.members.size;
        let required = Math.ceil(usersC/2);

        if(serverQueue.skipVotes.includes(message.member.id)) return message.reply("you already voted to skip!");

        serverQueue.skipVotes.push(message.member.id);
        message.channel.send(`**${message.author.username}** voted to skip the song. ***(${serverQueue.skipVotes.length}/${required} votes)***`);

        if(serverQueue.skipVotes.length >= required){
            serverQueue.connection.dispatcher.end();
            message.channel.send("⏭ Song has been skipped.");
        }
	}
}