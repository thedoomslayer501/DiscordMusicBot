const Discord = require('discord.js');
const ms = require('ms');

module.exports = {
    name: 'info',
    description: ' Shows information about the bot.',
    aliases: ['botinfo', 'about', 'stats'],
    category: 'system',
    execute(message){
        const embed = new Discord.MessageEmbed()
            .setColor('#d84d77')
            .setTitle("Information")
            .setDescription(`**${message.client.user.username}** is a simple music bot that allows users to stream and listen to their favorite music in a voice channel.\nNew features and updates are added regularly!`)
            .setThumbnail(message.client.user.avatarURL())
            .addFields(
                { name: "Uptime", value: ms(message.client.uptime, { long: true }), inline: true },
                { name: "Servers", value: message.client.guilds.cache.size, inline: true },
                { name: "Ping", value: `${message.client.ws.ping} ms`, inline: true },
                { name: "Links", value: "[**Invite**](https://discord.com/oauth2/authorize?client_id=785914972990865420&scope=bot) | [**Vote**](https://top.gg/bot/785914972990865420/vote)"}
            )
            .setFooter(message.client.user.username)
            .setTimestamp();
        message.channel.send(embed);
    }
}