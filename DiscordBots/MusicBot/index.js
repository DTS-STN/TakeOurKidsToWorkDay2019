const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const axios = require("axios");
require("dotenv").config();

const token = process.env.MUSIC_BOT_TOKEN || "notoken";
const apiKey = process.env.YT_API || "";

const client = new Discord.Client();
const queue = new Map();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on("reconnecting", () => {
  console.log(`${client.user.tag} is reconnecting`);
});
client.on("disconnect", () => {
  console.log(`${client.user} is disconnected`);
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!")) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`!play`)) {
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(`!skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`!stop`)) {
    stop(message, serverQueue);
    return;
  }
});

async function execute(message, serverQueue) {
  const voiceChannel = message.member.voiceChannel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }

  let query = message.content.substr(5).trim();
  let url = encodeURI(
    `${process.env.YT_URL}?key=${apiKey}&part=snippet&q=${query}&topicId=${process.env.MUSIC_TOPIC}&type=video&safeSearch=strict`
  );
  let videoUrl;
  let songInfo;
  let song;

  await axios.get(url).then(async response => {
    if (response.data) {
      if (response.data.items) {
        let item = response.data.items[0];
        videoUrl = `https://www.youtube.com/watch?v=${item.id.videoId}`;
        songInfo = await ytdl.getInfo(videoUrl);
        song = {
          title: songInfo.title,
          url: songInfo.video_url
        };
        console.log(song);
      }
    }
  });

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      console.log(queueContruct.songs);
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voiceChannel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voiceChannel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .playStream(ytdl(song.url))
    .on("end", () => {
      console.log("Music ended!");
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => {
      console.error(error);
    });
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

client.login(token);
