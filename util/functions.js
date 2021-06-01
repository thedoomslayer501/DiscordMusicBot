const ytdl = require('ytdl-core-discord');
const ytpl = require('ytpl');
let dcTimer, playingEmbed, errorCount = 0;

//--broadcast function start
async function broadcast(message, queue, embed){
    try{
        ytpl(message.guild.radio.selectedStation, { limit: Infinity })
            .then(playlist => {
                message.guild.radio.stationName = playlist.title;
                shuffle(playlist.items);
                playlist.items.slice(0, 50).forEach(async item => {
                    try{
                        videoHandler(await ytdl.getInfo(item.shortUrl));
                    }
                    catch(error){
                        if(`${error}`.search("decryption failed or bad record")){
                            videoHandler(await ytdl.getInfo(item.shortUrl));
                        }
                        else{
                            console.error(error);
                        }
                    }
                });
            });
    }
    catch(error){
        console.error(error);
    }

    //videoHandler function
    async function videoHandler(songInfo){
        clearTimeout(dcTimer);
        const serverQueue = queue.get(message.guild.id);
        const song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
            duration: songInfo.videoDetails.lengthSeconds,
            vlength: timeFormat(songInfo.videoDetails.lengthSeconds),
            thumbnail: !songInfo.videoDetails.thumbnails[4] ? songInfo.videoDetails.thumbnails[3].url : songInfo.videoDetails.thumbnails[4].url,
            requester: message.client.user
        }
        if(!serverQueue){
            const queueConstructor = {
                connection: null,
                isPlaying: true,
                vChannel: message.member.voice.channel,
                songs: [],
                station: !message.guild.radio ? null : message.guild.radio.stationName,
                skipVotes: [],
                loopSong: false,
                loopQueue: false,
                addIndex: 0
            }
            queue.set(message.guild.id, queueConstructor);
            queueConstructor.songs.push(song);
            try{
                queueConstructor.connection = await queueConstructor.vChannel.join();
                await queueConstructor.connection.voice.setSelfDeaf(true);
                play(message, queue, queueConstructor.songs[0], embed);
            }
            catch(error){
                console.error(error);
                queue.delete(message.guild.id);
            }
        }
        else{
            serverQueue.songs.push(song);
            serverQueue.station = message.guild.radio.stationName;
            if(serverQueue.songs.length === 1) play(message, queue, serverQueue.songs[0], embed);
        }
    }
}
//--broadcast function end

//shuffle function
function shuffle(array){
    for(let i = array.length - 1; i > 0; i--){
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
}

//timeFormat function
function timeFormat(duration){
    let hrs = ~~(duration / 3600);
    let mins = ~~((duration % 3600) / 60);
    let secs = ~~duration % 60;
  
    let ret = "";
  
    if(hrs > 0){
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
  
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

//--addSong function start
async function addSong(message, queue, songInfo, embed){
    clearTimeout(dcTimer);
    const serverQueue = queue.get(message.guild.id);
    const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
        duration: songInfo.videoDetails.lengthSeconds,
        vlength: songInfo.videoDetails.isLive ? "🔴LIVE" : timeFormat(songInfo.videoDetails.lengthSeconds),
        thumbnail: !songInfo.videoDetails.thumbnails[4] ? songInfo.videoDetails.thumbnails[3].url : songInfo.videoDetails.thumbnails[4].url,
        requester: message.author
    }
    if(!serverQueue){
        const queueConstructor = {
            connection: null,
            isPlaying: true,
            vChannel: message.member.voice.channel,
            songs: [],
            station: !message.guild.radio ? null : message.guild.radio.stationName,
            skipVotes: [],
            loopSong: false,
            loopQueue: false,
            addIndex: 0
        }
        queue.set(message.guild.id, queueConstructor);
        queueConstructor.songs.push(song);
        try{
            if(!message.guild.me.voice.channel) message.channel.send(`🔊 Joined voice channel **${message.member.voice.channel.name}**.`);
            queueConstructor.connection = await queueConstructor.vChannel.join();
            await queueConstructor.connection.voice.setSelfDeaf(true);
            play(message, queue, queueConstructor.songs[0], embed);
        }
        catch(error){
            console.error(error);
            queue.delete(message.guild.id);
        }
    }
    else{
        if(message.guild.radio && message.guild.radio.isPlaying){
            serverQueue.addIndex += 1;
            serverQueue.songs.splice(serverQueue.addIndex, 0, song);
            embed.setDescription(`✅ [${song.title}](${song.url}) \`[${song.vlength}]\` has been added to position **${serverQueue.songs.lastIndexOf(song)}** of queue.`)
                .setThumbnail(song.thumbnail);
            message.channel.send(embed);
        }
        else{
            serverQueue.songs.push(song);
            if(serverQueue.songs.length === 1) play(message, queue, serverQueue.songs[0], embed);
            if(serverQueue.songs.length > 1){
                embed.setDescription(`✅ [${song.title}](${song.url}) \`[${song.vlength}]\` has been added to position **${serverQueue.songs.lastIndexOf(song)}** of queue.`)
                    .setThumbnail(song.thumbnail);
                message.channel.send(embed);
            }
        }
    }
}
//--addSong function end

//--addPlaylist function start
async function addPlaylist(message, queue, url, embed){
    ytpl(url, { limit: Infinity })
        .then(playlist => {
            try{
                embed.setDescription(`✅ Queued \`${playlist.items.length}\` songs from playlist [${playlist.title}](${playlist.url}).`)
                    .setTitle("Playlist Added")
                    .setThumbnail(playlist.bestThumbnail.url);
                message.channel.send(embed);
                playlist.items.forEach(async item => {
                    try{
                        videoHandler(await ytdl.getInfo(item.shortUrl));
                    }
                    catch(error){
                        if(`${error}`.search("decryption failed or bad record")){
                            videoHandler(await ytdl.getInfo(item.shortUrl));
                        }
                        else{
                            console.error(error);
                        }
                    }
                })
            }
            catch(error){
                console.error(error);
            }
        });

    //videoHandler function
    async function videoHandler(songInfo){
        clearTimeout(dcTimer);
        const serverQueue = queue.get(message.guild.id);
        const song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
            duration: songInfo.videoDetails.lengthSeconds,
            vlength: songInfo.videoDetails.isLive ? "🔴LIVE" : timeFormat(songInfo.videoDetails.lengthSeconds),
            thumbnail: !songInfo.videoDetails.thumbnails[4] ? songInfo.videoDetails.thumbnails[3].url : songInfo.videoDetails.thumbnails[4].url,
            requester: message.author
        }
        if(!serverQueue){
            const queueConstructor = {
                connection: null,
                isPlaying: true,
                vChannel: message.member.voice.channel,
                songs: [],
                station: !message.guild.radio ? null : message.guild.radio.stationName,
                skipVotes: [],
                loopSong: false,
                loopQueue: false,
                addIndex: 0
            }
            queue.set(message.guild.id, queueConstructor);
            queueConstructor.songs.push(song);
            try{
                if(!message.guild.me.voice.channel) message.channel.send(`🔊 Joined voice channel **${message.member.voice.channel.name}**.`);
                queueConstructor.connection = await queueConstructor.vChannel.join();
                await queueConstructor.connection.voice.setSelfDeaf(true);
                play(message, queue, queueConstructor.songs[0], embed);
            }
            catch(error){
                console.error(error);
                queue.delete(message.guild.id);
            }
        }
        else{
            if(message.guild.radio && message.guild.radio.isPlaying){
                serverQueue.addIndex += 1;
                serverQueue.songs.splice(serverQueue.addIndex, 0, song);
            }
            else{
                serverQueue.songs.push(song);
            }
            if(serverQueue.songs.length === 1) play(message, queue, serverQueue.songs[0], embed);
        }
    }
}
//--addPlaylist function end

//--play function start
async function play(message, queue, song, embed){
    const serverQueue = queue.get(message.guild.id);
    if(!song){
        serverQueue.isPlaying = false;
        if(message.guild.radio && message.guild.radio.isPlaying){
            queue.delete(message.guild.id);
            broadcast(message, queue, embed);
        }
        else{
            dcTimer = setTimeout(() => serverQueue.vChannel.leave(), 600000);
        }
        return;
    }
    const dispatcher = serverQueue.connection
        .play(await ytdl(song.url), { volume: 0.5, filter: 'audioonly', quality: 'highestaudio', type: 'opus' })
        .on('finish', () => {
            playingEmbed.delete();
            serverQueue.skipVotes = [];
            errorCount = 0;
            if(message.guild.radio && message.guild.radio.isPlaying){
                serverQueue.addIndex -= 1;
                if(serverQueue.addIndex < 0) serverQueue.addIndex = 0;
            }
            if(serverQueue.loopSong){
                play(message, queue, serverQueue.songs[0], embed);
            }
            else if(serverQueue.loopQueue){
                serverQueue.songs.push(serverQueue.songs[0]);
                serverQueue.songs.shift();
                play(message, queue, serverQueue.songs[0], embed);
            }
            else{
                serverQueue.songs.shift();
                play(message, queue, serverQueue.songs[0], embed);
            }
        })
        .on('error', error => {
            playingEmbed.delete();
            if(`${error}`.search("decryption failed or bad record") && errorCount < 3){
                errorCount += 1;
                play(message, queue, serverQueue.songs[0], embed);
            }
            else{
                console.error(error);
                console.log(song);
                embed.setDescription(`❌ Couldn't play track [${song.title}](${song.url}) \`[${song.vlength}]\``)
                    .setTitle("Music Playback")
                    .setFooter(`Requested by ${song.requester.username}`)
                    .setTimestamp();
                message.channel.send(embed);
                serverQueue.songs.shift();
                play(message, queue, serverQueue.songs[0], embed);
            }
        })
        embed.setDescription(`▶️ Now playing [${song.title}](${song.url}) \`[${song.vlength}]\``)
            .setTitle("Music Playback")
            .setFooter(`Requested by ${song.requester.username}`)
            .setTimestamp()
            .setThumbnail(song.thumbnail);
        playingEmbed = await message.channel.send(embed);
        serverQueue.isPlaying = true;
}
//--play function end

function getUserFromMention(mention) {
	if(!mention) return;

	if(mention.startsWith('<@') && mention.endsWith('>')){
		mention = mention.slice(2, -1);

		if(mention.startsWith('!')){
			mention = mention.slice(1);
		}

		return client.users.cache.get(mention);
	}
}

module.exports = { broadcast, timeFormat, addSong, addPlaylist, getUserFromMention }