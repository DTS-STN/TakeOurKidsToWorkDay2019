const Discord = require("discord.js");
const client = new Discord.Client();
const en = require("./en.json");
const fr = require("./fr.json");
const ocService = require("./ocService");
require("dotenv").config();

// API key should be tokenized for security purposes
const token = process.env.OCTRANSPO_TOKEN || "";

// Connection event handlers with logging
client.on("ready", () => {
  client.user.setStatus("available", "Type !OC to start");
  client.user.setActivity("Type !OC to start", { type: "WATCHING" });
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on("reconnecting", () => {
  console.log(`${client.user.tag} is reconnecting`);
});
client.on("disconnect", () => {
  console.log(`${client.user.tag} is disconnected`);
});

function prettyPrintStopInfo(stopInfo) {
  return `Route ${stopInfo.RouteNo} going to ${stopInfo.RouteHeading}`;
}

function prettyPrintTrips(trip) {
  let tripInfo = `${trip.RouteNo} - ${trip.RouteLabel} \n`;
  if (typeof trip.Trips.Trip !== "undefined") {
    trip.Trips.Trip.forEach(trip => {
      console.log(trip);
      tripInfo += `   Destination: ${trip.TripDestination} arriving at ${trip.TripStartTime} \n`;
    });
  } else {
    tripInfo += `   no outgoing trips for this route\n`;
  }
  return tripInfo + "\n";
}

function prettyPrintTripsAllRoutes(trip) {
  let tripInfo = `  **RouteNo:** ${trip.RouteNo}\n`;
  if (typeof trip.Trips !== "undefined" && trip.Trips.length > 0) {
    trip.Trips.forEach(trip => {
      console.log(trip);
      tripInfo += `    **Destination:** ${trip.TripDestination} **arriving at** ${trip.TripStartTime} \n`;
    });
  } else {
    tripInfo += `    no outgoing trips for this route\n`;
  }
  return tripInfo;
}

// Message event handler
client.on("message", msg => {
  // Ignore message from self
  if (msg.author.bot) return;
  // The message was intended for this bot
  if (msg.content.startsWith("!OC")) {
    let language;
    msg.reply("Chose your language: / Choisissez votre langue: (en / fr)");
    const collector = new Discord.MessageCollector(
      msg.channel,
      m => m.author.id === msg.author.id,
      { time: 10000 }
    );
    collector.once("collect", languageChoice => {
      switch (languageChoice.content.toLocaleLowerCase()) {
        case "en":
          language = en;
          break;

        case "fr":
          language = fr;
          break;

        default:
          languageChoice.reply(
            "Invalid language, type !OC to try again / Langue non valide, tapez !OC pour réessayer"
          );
          return;
      }
      languageChoice.reply(language.menu);
      // Handle the users response
      collector.once("collect", message => {
        const choice = parseInt(message.content);
        switch (choice) {
          // List routes that stop at TDLC
          case 1:
            ocService.getRoutesByStop(5718).then(response => {
              let stopList = "";
              response.forEach(stop => {
                stopList += prettyPrintStopInfo(stop) + "\n";
              });
              message.channel.send(stopList);
            });
            break;
          case 2:
            message.channel.send("Which route?");
            collector.once("collect", message => {
              ocService
                .getDeparturesByStop(5718, message.content)
                .then(response => {
                  let tripList = "";
                  response.forEach(trip => {
                    tripList += prettyPrintTrips(trip);
                  });
                  message.channel.send(tripList + "\n");
                });
            });
            break;
          case 3:
            message.channel.send("Which stop?");
            collector.once("collect", message => {
              ocService
                .getAllDeparturesByStop(message.content)
                .then(response => {
                  let tripList = `**Stop number** ${response.StopNo}: ${response.StopDescription}\n`;
                  response.Routes.Route.forEach(trip => {
                    tripList += prettyPrintTripsAllRoutes(trip);
                  });
                  message.channel.send(tripList + "\n");
                });
            });
            break;

          default:
            message.channel.send(
              `Sorry, "${message.content}" is not a valid option`
            );
            break;
        }
      });
    });
  }
});
// Create connection to Discord API
client.login(token);
