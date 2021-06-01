const { OWNER } = require('../util/config.json');

module.exports = {
    name: 'forceskip',
    description: 'Force skips current song. ***DJ role only!***',
    aliases: ['fs'],
    category: 'music',
	execute(message, queue){
        const serverQueue = queue.get(message.guild.id);

        if(!message.guild.me.voice.channel) 
            return message.channel.send(`⚠️ **${message.client.user.username}** is not connected to a voice channel.`);

        if(!serverQueue || !serverQueue.songs.length) return message.channel.send("⚠️ Music queue is empty.");

        if(message.author.id === OWNER || message.member.roles.cache.some(role => role.name === 'DJ')){
            serverQueue.connection.dispatcher.end();
            message.channel.send("⏭ Force skipped song.");
        }
        else{
            message.channel.send("🚫 You need a DJ role to use this command!");
        }
	}
}