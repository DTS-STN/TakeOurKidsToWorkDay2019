const Discord = require("discord.js");
const client = new Discord.Client();
const axios = require("axios");
require("dotenv").config();

// API key should be tokenized for security purposes
const token = process.env.BOT_NAME_TOKEN || "";

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
  if (message.author.bot) return;
  if (msg.content.startsWith("!command")) {
  }
});
// Create connection to Discord API
client.login(token);
