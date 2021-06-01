module.exports = {
    name: 'ping',
    description: 'Shows the bot\'s response time.',
    aliases: ['pong'],
    category: 'system',
    execute(message){
        message.channel.send(`⏱️ **${message.client.ws.ping} ms**`);
    }
}