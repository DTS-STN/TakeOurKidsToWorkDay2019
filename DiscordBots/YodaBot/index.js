const Discord = require("discord.js");
const client = new Discord.Client();
const axios = require("axios");
require("dotenv").config();

const token = process.env.YODA_TOKEN || "";

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", msg => {
  if (msg.content.substring(0, 5) === "!yoda") {
    let messageContent = msg.content.substring(5);
    axios
      .get(`http://yoda-api.appspot.com/api/v1/yodish?text=${messageContent}`)
      .then(response => {
        console.log(response.data.yodish);
        msg.reply(response.data.yodish);
      })
      .catch(() => {
        console.log(">:(");
        msg.reply("Sorry, this doesn't work yet");
      });
  }
});

client.login(token);
