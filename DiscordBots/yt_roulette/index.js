const Discord = require("discord.js");
const client = new Discord.Client();
const axios = require("axios");
require("dotenv").config();

const token = process.env.YT_BOT_TKN || "";
const apiKey = process.env.YT_API || "";

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });
  client.on("reconnecting", () => {
    console.log(`${client.user.tag} is reconnecting`);
  });
  client.on("disconnect", () => {
    console.log(`${client.user} is disconnected`);
  });

client.on("message", msg => {
    if (msg.content.startsWith("!yt")){
        let message = msg.content.substr(3).trim();
        let url = encodeURI(`${process.env.YT_URL}?key=${apiKey}&part=snippet&q=${message}&topicId=${process.env.MUSIC_TOPIC}&type=video&safeSearch=strict`);
        axios
        .get(url)
        .then(response => {
            if (response.data){
                if (response.data.items){
                    let item = response.data.items[0];
                    console.log(item);
                    let reply = `https://www.youtube.com/watch?v=${item.id.videoId}`;
                    msg.reply(reply);
                }
            }
        });
    }
    return;
});

client.login(token);