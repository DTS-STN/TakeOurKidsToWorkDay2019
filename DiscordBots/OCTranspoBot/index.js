const Discord = require("discord.js");
const client = new Discord.Client();
const axios = require("axios");
const en = require("./en.json");
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
  const collector = new Discord.MessageCollector(
    msg.channel,
    m => m.author.id === msg.author.id,
    { time: 10000 }
  );
  // Ignore message from self
  if (msg.author.bot) return;
  if (msg.content.startsWith("!OC")) {
    msg.reply(en.menu);

    // Handle the users response
    collector.once("collect", message => {
      const choice = parseInt(message.content);
      switch (choice) {
        case 1:
          message.channel.send("enter a valid stop number");
          collector.once("collect", message => {
            getRoutesByStop(message.content).then(response => {
              message.channel.send(
                JSON.stringify(
                  response.GetRouteSummaryForStopResult.Routes.Route
                ).substring(0, 1999)
              );
            });
          });
          break;
        case 2:
          message.channel.send("enter a valid stop number");
          collector.once("collect", message => {});
          break;
        default:
          message.channel.send(
            `Sorry, "${message.content}" is not a valid option`
          );
          break;
      }
    });
  }
});
// Create connection to Discord API
client.login(token);
