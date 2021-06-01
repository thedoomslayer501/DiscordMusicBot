const { addSong, addPlaylist } = require('../util/functions.js');
const ytdl = require('ytdl-core-discord');
const Discord = require('discord.js');

module.exports = {
    name: 'play',
    description: 'Adds a song or playlist to queue.',
    aliases: ['p', 'pl'],
    usage: '[queries or YouTube URL]',
    category: 'music',
	async execute(message, queue, args, searcher){
        const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
        const playlistPattern =  /^.*(list=)([^#\&\?]*).*/gi;
        const url = args[0];
        const urlValid = videoPattern.test(args[0]);
        const playlistValid = playlistPattern.test(args[0]);

        const embed = new Discord.MessageEmbed()
            .setTitle("Song Added")
            .setFooter(`Added by ${message.author.username}`)
            .setTimestamp()
            .setColor('#d84d77');

        if(!message.member.voice.channel && !message.guild.me.voice.channel) return message.channel.send("⚠️ Please join a voice channel first.");

        if(message.guild.me.voice.channel && (message.member.voice.channel != message.guild.me.voice.channel))
            return message.channel.send(`🚫 You need to be in **${ message.guild.me.voice.channel.name}** to use this command!`);

        if(!args.length) return message.channel.send("⚠️ Please enter a song's title or YouTube URL.");
        
        if(urlValid && !playlistValid){
            try{
                const songInfo = await ytdl.getInfo(url);
                addSong(message, queue, songInfo, embed);
            }
            catch(error){
                console.error(error);
                message.channel.send("⚠️ Couldn't add song.")
            }
        }
        else if(playlistValid){
            try{
                addPlaylist(message, queue, url, embed);
            }
            catch(error){
                console.error(error);
                message.channel.send("⚠️ Couldn't add playlist.")
            }
        }
        else{
            try{
                let results = await searcher.search(args.join(" "), { type: 'video' });
                if(!results.first) return message.channel.send("⚠️ Couldn't find results.");
                const songInfo = await ytdl.getInfo(results.first.url);
                addSong(message, queue, songInfo, embed);
            }
            catch(error){
                console.error(error);
                message.channel.send("⚠️ Couldn't find results.");
            }
        }
	}
}