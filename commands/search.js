const Discord = require('discord.js');

module.exports = {
    name: 'search',
    description: 'Searches YouTube for a video to select and add to queue.',
    aliases: ['yt', 'youtube'],
    usage: '[queries]',
    category: 'music',
    async execute(message, queue, args, searcher){
        const urlPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
        const isUrl = urlPattern.test(args[0]);

        const embed = new Discord.MessageEmbed()
            .setTitle("YouTube Search")
            .setFooter(`${message.author.username}, type a number to make a choice. Type cancel to exit. Timeout: 30 seconds.`)
            .setColor('#d84d77');

        if(!message.member.voice.channel && !message.guild.me.voice.channel) return message.channel.send("⚠️ Please join a voice channel first.");
        
        if(message.guild.me.voice.channel && (message.member.voice.channel != message.guild.me.voice.channel))
            return message.channel.send(`🚫 You need to be in **${message.guild.me.voice.channel.name}** to use this command!`);

        if(!args.length)
            return message.channel.send("⚠️ Please enter search queries.");

        if(isUrl)
            return message.channel.send("⚠️ No URLs allowed.");

        if(message.member.activeCollector)
            return message.reply(" the \`search\` command is already being used by you!");

        try{
            let results = await searcher.search(args.join(" "), { type: 'video'});
            let video = `\`1.\` [${results.first.title}](${results.first.url})\n`;
            for(let i = 1; i < 10; i++){
                video += `\`${i + 1}.\` [${results.currentPage[i].title}](${results.currentPage[i].url})\n`;
            }
            embed.setDescription(`**__Search Results:__**\n${video}`);
            const resultsMessage = await message.channel.send(embed);

            let timeout = setTimeout(() => message.channel.send("⏲️ **Timeout!**"), 30000);

            message.member.activeCollector = true;

            const filter = response => {
                return (response.content > 0 && response.content <= 10) && response.author.id === message.author.id 
                    || (response.author.id === message.author.id && response.content.toLowerCase() === "cancel")
                    || (response.content === "⏲️ **Timeout!**" && response.author.id === message.client.user.id);
            }

            const responseMsg = await message.channel.awaitMessages(filter, { max: 1 });

            if(responseMsg.first().content.toLowerCase() === "cancel"){
                message.channel.send("❌ **Canceled!**");
                resultsMessage.delete();
                message.member.activeCollector = false;
                clearTimeout(timeout);
                return;
            }
            if(responseMsg.first().content === "⏲️ **Timeout!**"){
                resultsMessage.delete();
                message.member.activeCollector = false;
                return;
            }
            const videoIndex = parseInt(responseMsg.first().content);
            const choice = results.currentPage[videoIndex - 1].url;
            message.client.commands.get("play").execute(message, queue, [choice], searcher);
            message.member.activeCollector = false;
            resultsMessage.delete();
            responseMsg.first().delete();
            clearTimeout(timeout);
        }
        catch(error){
            console.error(error);
            message.member.activeCollector = false;
            message.channel.send("⚠️ Couldn\'t find song or results.");
        }
    }
}