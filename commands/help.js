const { PREFIX } = require('../util/config.json');
const Discord = require('discord.js');
const prefix = require('discord-prefix');

module.exports = {
    name: 'help',
    description: 'Lists all commands, or info about a specific command.',
    aliases: ['commands', 'h'],
    usage: '[command name]',
    cooldown: 5,
    category: 'system',
    execute(message, queue, args){
        const musicCommands = [];
        const systemCommands = [];
        const settingsCommands = [];

        const { commands } = message.client;
        
        const embed = new Discord.MessageEmbed()
            .setColor('#d84d77')
            .setFooter(message.client.user.username)
            .setTimestamp();

        let guildPrefix = prefix.getPrefix(message.guild.id);
        if(!guildPrefix) guildPrefix = PREFIX;

        if(!args.length){
            musicCommands.push(commands.filter(command => command.category === 'music').map(command => `\`${command.name}\``).join(', '));
            systemCommands.push(commands.filter(command => command.category === 'system').map(command => `\`${command.name}\``).join(', '));
            settingsCommands.push(commands.filter(command => command.category === 'settings').map(command => `\`${command.name}\``).join(', '));
            embed.setDescription(`Bot commands for **${message.client.user.username}**.\nYou can send \`${guildPrefix}help [command name]\` to get info on a specific command.`)
                .setImage('https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/c82942d6-8b71-4db5-8777-bb80cebbe6a0/dbj38ak-dc0ff300-9702-4c0e-a952-6a0231a46896.png/v1/fill/w_1024,h_576,q_80,strp/steins_gate__kurisu_and_faris_minimalism_wallpaper_by_carionto_dbj38ak-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOiIsImlzcyI6InVybjphcHA6Iiwib2JqIjpbW3siaGVpZ2h0IjoiPD01NzYiLCJwYXRoIjoiXC9mXC9jODI5NDJkNi04YjcxLTRkYjUtODc3Ny1iYjgwY2ViYmU2YTBcL2RiajM4YWstZGMwZmYzMDAtOTcwMi00YzBlLWE5NTItNmEwMjMxYTQ2ODk2LnBuZyIsIndpZHRoIjoiPD0xMDI0In1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.E_DvYkr_PKiowHRafMjfNJlvPr0dyOoSPWukhlog4Ww')
                .setTitle("Help | Bot Commands")
                .addFields(
                    { name: `System — ${commands.filter(command => command.category === 'system').map(command => command).length}`, value: systemCommands },
                    { name: `Music — ${commands.filter(command => command.category === 'music').map(command => command).length}`, value: musicCommands },
                    { name: `Settings — ${commands.filter(command => command.category === 'settings').map(command => command).length}`, value: settingsCommands }
                );
            return message.channel.send(embed).catch(console.error);
        }

        const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if(!command){
			return message.channel.send('⚠️ That\'s not a valid command!');
        }
        
        embed.setDescription(command.description)
            .setTitle(`Help | ${command.name}`)
            .addFields(
                { name: "Aliases", value: `${command.aliases.join(', ')}` },
                { name: "Usage", value: command.usage ? `\`${guildPrefix}${command.name} ${command.usage}\`` : `\`${guildPrefix}${command.name}\`` },
                { name: "Cooldown", value: `${command.cooldown || 3} seconds` }
            );
        message.channel.send(embed).catch(console.error);
    }
}