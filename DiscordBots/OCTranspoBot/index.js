const Discord = require("discord.js");
const client = new Discord.Client();
const axios = require("axios");
require("dotenv").config();

// API key should be tokenized for security purposes
const token = process.env.OCTRANSPO_TOKEN || "";
const appId = "0593fb82";
const apiKey = "bff5a13a6823320bbe487c96d71483f5";

// Connection event handlers with logging
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on("reconnecting", () => {
  console.log(`${client.user.tag} is reconnecting`);
});
client.on("disconnect", () => {
  console.log(`${client.user.tag} is disconnected`);
});

function getRoutesByStop(stopNumber) {
  return axios
    .get(
      `https://api.octranspo1.com/v1.3/GetRouteSummaryForStop?appID=${appId}&apiKey=${apiKey}&stopNo=${stopNumber}&format=JSON`
    )
    .then(response => {
      console.log(response.data);
      return response.data;
    })
    .catch(err => {
      console.log(err);
    });
}

// Message event handler
client.on("message", msg => {
  // Ignore message from self
  if (msg.author.bot) return;
  if (msg.content.startsWith("!OC")) {
    getRoutesByStop("3037").then(data => {
      console.log("API returned: " + data);
      msg.reply(data.GetRouteSummaryForStopResult.StopDescription);
    });
  }
});
// Create connection to Discord API
client.login(token);
