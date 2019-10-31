const Discord = require("discord.js");
const client = new Discord.Client();
const axios = require("axios");
require("dotenv").config();

// API key should be tokenized for security purposes
const token = process.env.RPS_TOKEN || "";

const choices = ["rock", "paper", "scissors"];

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

// Message event handler
client.on("message", msg => {
  // Ignore message from self
  if (msg.author.bot) return;
  if (msg.content.toLocaleLowerCase().startsWith("!rps")) {
    // Initiate a collector to read responses
    const collector = new Discord.MessageCollector(
      msg.channel,
      m => m.author.id === msg.author.id,
      { time: 10000 }
    );
    // players choice
    let humanPlayer;
    // computers choice
    let botPlayer = choices[Math.floor(Math.random() * 3)];
    console.log(`Bot chose ${botPlayer}`);
    // This was a terrible idea
    msg.react("✊").then(msg.react("✋").then(msg.react("✌")));
    msg.channel.send(
      `Alright ${msg.author}, type "rock", "paper" or "scissors"`
    );
    // Handle the users response
    collector.on("collect", message => {
      humanPlayer = message.content.toLocaleLowerCase();
      console.log(`player chose ${humanPlayer}`);
      if (humanPlayer === botPlayer) {
        message.reply(" you tied with the bot");
      } else if (humanPlayer === "rock") {
        if (botPlayer === "paper") {
          message.reply(` you lose. ${botPlayer} covers ${humanPlayer}`);
        } else {
          message.reply(` you win! ${humanPlayer} smashes ${botPlayer}`);
        }
      } else if (humanPlayer === "paper") {
        if (botPlayer === "scissors") {
          message.reply(` you lose. ${botPlayer} cuts ${humanPlayer}`);
        } else {
          message.reply(` you win! ${humanPlayer} covers ${botPlayer}`);
        }
      } else if (humanPlayer === "scissors") {
        if (botPlayer === "rock") {
          message.reply(` you lose. ${botPlayer} smashes ${humanPlayer}`);
        } else {
          message.reply(` you win! ${humanPlayer} cuts ${botPlayer}`);
        }
      } else {
        message.reply(` i dont know what to do with "${humanPlayer}"`);
      }
    });
  }
});
// Create connection to Discord API
client.login(token);
