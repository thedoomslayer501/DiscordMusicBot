const { PREFIX } = require('../util/config.json');
const prefix = require('discord-prefix');

module.exports = {
    name: 'prefix',
    description: 'Sets the bot\'s prefix for the server.\nType \`reset\` after command name to go back to default prefix.\nIf you are unable to use the current prefix, you can also use mention as a prefix.',
    usage: '[newPrefix]',
    aliases: ['pre'],
    cooldown: 5,
    category: 'settings',
    execute(message, queue, args){
        if(message.member.hasPermission('MANAGE_GUILD')){
            if(!args.length) return message.channel.send("⚠️ Please specify the new prefix.");
            if(args[0] === 'reset'){
                prefix.setPrefix(PREFIX, message.guild.id);
                return message.channel.send(`Prefix has been reset to \`${PREFIX}\``);
            }
            const newPrefix = args[0];
            prefix.setPrefix(newPrefix, message.guild.id);
            message.channel.send(`Prefix has been set to \`${newPrefix}\``);
        }
        else{
            message.reply("🚫 You do not have the required permissions to change the prefix.");
        }
    }
}