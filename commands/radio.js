const { RockMetal, ClassicRock, Pop, JapaneseAnime, Kpop, EightiesMusic, Country, Disco } = require('../util/playlists.json');
const { broadcast } = require('../util/functions.js');
const ytpl = require('ytpl');
const Discord = require('discord.js');

module.exports = {
    name: 'radio',
    description: 'Plays random songs from radio stations.',
    aliases: ['changestation'],
    cooldown: 10,
    category: 'music',
    async execute(message, queue){
        const serverQueue = queue.get(message.guild.id);
        let currentSong;

        if(!message.member.voice.channel) return message.channel.send("⚠️ Please join a voice channel first.");

        if((message.guild.radio && message.guild.radio.isPlaying) && message.guild.me.voice.channel && (message.member.voice.channel != message.guild.me.voice.channel))
            return message.channel.send(`🚫 You need to be in **${message.guild.me.voice.channel.name}** to use this command!`);

        if(message.guild.activeCollector)
            return message.channel.send("⚠️ The \`radio\` command is already being used by another member!");

        if(serverQueue && (serverQueue.loopSong || serverQueue.loopQueue)) return message.channel.send("⚠️ Cannot turn on radio while Song Loop or Queue Loop is on.");

        if(serverQueue && serverQueue.isPlaying) currentSong = serverQueue.songs[0];

        if(!message.guild.radio){
            message.guild.radio = {
                stations: [RockMetal, ClassicRock, Pop, JapaneseAnime, Kpop, EightiesMusic, Country, Disco],
                selectedStation: null,
                stationName: null,
                isPlaying: false
            }
        }

        const stationsList  = "\n**Music Stations:**\n\`1\`. Rock/Metal\n\`2\`. Classic Rock\n\`3\`. Pop\n\`4\`. Japanese/Anime\n\`5\`. K-Pop\n\`6\`. 80's Music\n\`7\`. Country\n\`8\`. Disco\n";

        const embed = new Discord.MessageEmbed()
            .setTitle("Music Stations")
            .setDescription(`📻 Choose a music station to play in **${message.member.voice.channel.name}**.\n${stationsList}`)
            .setFooter(`${message.author.username}, type a number to make a choice. Type cancel to exit. Timeout: 30 seconds.`)
            .setColor('#d84d77');
        const stationsMessage = await message.channel.send(embed);
        
        let timeout = setTimeout(() => message.channel.send("⏲️ **Timeout!**"), 30000);

        message.guild.activeCollector = true;

        const filter = response => {
            return (response.content > 0 && response.content <= message.guild.radio.stations.length) && response.author.id === message.author.id 
                || (response.author.id === message.author.id && response.content.toLowerCase() === "cancel")
                || (response.content === "⏲️ **Timeout!**" && response.author.id === message.client.user.id);
        }

        const responseMsg = await message.channel.awaitMessages(filter, { max: 1 });

        if(responseMsg.first().content.toLowerCase() === "cancel"){
            message.channel.send("❌ **Canceled!**");
            stationsMessage.delete();
            message.guild.activeCollector = false;
            clearTimeout(timeout);
            return;
        }
        if(responseMsg.first().content === "⏲️ **Timeout!**"){
            stationsMessage.delete();
            message.guild.activeCollector = false;
            return;
        }

        //cleanup function
        function cleanup(){
            message.guild.activeCollector = false;
            stationsMessage.delete();
            responseMsg.first().delete();
            clearTimeout(timeout);
        }

        try{
            let choice = parseInt(responseMsg.first().content) - 1;
            if(message.guild.radio.selectedStation === message.guild.radio.stations[choice]){
                message.channel.send(`⚠️ The \`${serverQueue.station}\` station is already playing!`);
                cleanup();
            }
            else{
                message.guild.radio.selectedStation = message.guild.radio.stations[choice];
                await ytpl(message.guild.radio.selectedStation)
                    .then(playlist => {
                        cleanup();
                        if(serverQueue && serverQueue.isPlaying){
                            serverQueue.songs = serverQueue.songs.filter(song => song.requester.id != message.client.user.id);
                            if(currentSong.requester.id === message.client.user.id) serverQueue.songs.unshift(currentSong);
                        }
                        broadcast(message, queue, embed);
                        message.guild.radio.isPlaying = true;
                        if(message.guild.me.voice.channel){
                            embed.setDescription(`📻 Station selected: \`${playlist.title}\``)
                                .setTitle("Music Radio")
                                .setFooter(`Requested by ${message.author.username}`)
                                .setTimestamp();
                            message.channel.send(embed);
                        }
                        else{
                            embed.setDescription(`🔊 Joining voice channel **${message.member.voice.channel.name}**.\n📻 Station selected: \`${playlist.title}\``)
                                .setTitle("Music Radio")
                                .setFooter(`Requested by ${message.author.username}`)
                                .setTimestamp();
                            message.channel.send(embed);
                        }
                    });
            }
        }
        catch(error){
            cleanup();
            console.error(error);
        }
    }
}