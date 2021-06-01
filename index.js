const { TOKEN, YT_API_KEY, PREFIX, TOPGG_TOKEN } = require('./util/config.json');
const { YTSearcher } = require('ytsearcher');

const Discord = require('discord.js');
const fs = require('fs');

const prefix = require('discord-prefix');


const queue = new Map();
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

const AutoPoster = require('topgg-autoposter');
AutoPoster(TOPGG_TOKEN, client);

let dcTimer;

const searcher = new YTSearcher({
    key: YT_API_KEY
});

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles){
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.username}`);
    client.user.setActivity(`${PREFIX}help`);
})

//--command handler start
client.on('message', message => {
    let guildPrefix = prefix.getPrefix(message.guild.id);
    if(!guildPrefix) guildPrefix = PREFIX;
    if(message.content.startsWith(`<@!${message.client.user.id}>`)) guildPrefix = `<@!${message.client.user.id}>`;

    if(!message.content.startsWith(guildPrefix) || message.author.bot) return;
    
	const args = message.content.slice(guildPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if(!command) return;

    if(message.channel.type === 'dm'){
		return message.reply("I can\'t execute that command inside DMs!");
    }

    if(!cooldowns.has(command.name)){
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if(timestamps.has(message.author.id)){
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if(now < expirationTime){
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`⏳ please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    try{
	    command.execute(message, queue, args, searcher);
    }
    catch(error){
	    console.error(error);
    }
})
//--command handler end

client.on('voiceStateUpdate', (oldState, newState) => {
    //check if bot leaves voice channel
    if(newState.id === client.user.id && !newState.channelID){
        clearTimeout(dcTimer);
        if(oldState.guild.radio) oldState.guild.radio = null;
        queue.delete(oldState.guild.id);
    }
    //check if new member joins voice channel
    if(newState.id != client.user.id 
            && newState.guild.me.voice.channel 
            && oldState.channelID != newState.channelID 
            && newState.channelID === newState.guild.me.voice.channelID){
        clearTimeout(dcTimer);
    }
    //check if no members are in voice channel
    if(newState.id != client.user.id 
            && newState.guild.me.voice.channel 
            && oldState.channelID != newState.channelID 
            && oldState.channelID === newState.guild.me.voice.channelID 
            && newState.guild.me.voice.channel.members.size === 1){
        dcTimer = setTimeout(() => newState.guild.me.voice.channel.leave(), 300000);
    }
})

client.login(TOKEN);