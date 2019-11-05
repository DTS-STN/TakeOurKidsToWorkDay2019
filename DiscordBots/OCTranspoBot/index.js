const Discord = require("discord.js");
const client = new Discord.Client();
const en = require("./en.json");
const fr = require("./fr.json");
const ocService = require("./ocService");
require("dotenv").config();

// API key should be tokenized for security purposes
const token = process.env.OCTRANSPO_TOKEN || "";

function prettyPrintStopInfo(stopInfo, language) {
  return `**${language.route}:** ${stopInfo.RouteNo} **${language.goingTo}:** ${stopInfo.RouteHeading}`;
}

function prettyPrintTrips(trip, language) {
  let tripInfo = `${trip.RouteNo} - ${trip.RouteLabel} \n`;
  if (typeof trip.Trips.Trip !== "undefined") {
    trip.Trips.Trip.forEach(trip => {
      tripInfo += `   **${language.destination}:** ${trip.TripDestination} **${language.arrivingAt}** ${trip.TripStartTime} \n`;
    });
  } else {
    tripInfo += `   *${language.noOutgoing}*\n`;
  }
  return tripInfo + "\n";
}

function prettyPrintTripsAllRoutes(trip, language) {
  let tripInfo = `  **${language.route}:** ${trip.RouteNo}\n`;
  if (typeof trip.Trips !== "undefined" && trip.Trips.length > 0) {
    trip.Trips.forEach(trip => {
      tripInfo += `    **${language.destination}:** ${trip.TripDestination} **${language.arrivingAt}** ${trip.TripStartTime} \n`;
    });
  } else {
    tripInfo += `    *${language.noOutgoing}*\n`;
  }
  return tripInfo;
}

// Message event handler
client.on("message", msg => {
  // Ignore message from self
  if (msg.author.bot) return;
  // The message was intended for this bot
  if (msg.content.startsWith("!OC")) {
    let language = en;
    const collector = new Discord.MessageCollector(
      msg.channel,
      m => m.author.id === msg.author.id,
      { time: 50000 }
    );
    msg.reply("Chose your language: • Choisissez votre langue: (en / fr)");
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
            "Invalid language, type !OC to try again • Langue non valide, tapez !OC pour réessayer"
          );
          return;
      }
      languageChoice.reply(language.menu);
      // Handle the users response
      collector.once("collect", message => {
        const choice = parseInt(message.content);
        switch (choice) {
          /** Route 1. get routes for TDLC **/
          case 1:
            ocService.getRoutesByStop(5718).then(response => {
              let stopList = "";
              response.forEach(stop => {
                stopList += prettyPrintStopInfo(stop, language) + "\n";
              });
              message.channel.send(stopList);
            });
            break;

          /** Route 2. get next 3 departures for a route at TDLC **/
          case 2:
            message.channel.send(`${language.whichRoute}?`);
            collector.once("collect", message => {
              ocService
                .getDeparturesByStop(5718, message.content)
                .then(response => {
                  let tripList = "";
                  if (Array.isArray(response)) {
                    response.forEach(trip => {
                      tripList += prettyPrintTrips(trip, language);
                    });
                  } else {
                    tripList += language.noOutgoing;
                  }
                  message.channel.send(tripList + "\n");
                })
                .catch(err => {
                  message.channel.send(err.message);
                });
            });
            break;

          /** Route 3. get next 3 departures for all routes at a stop **/
          case 3:
            message.channel.send(`${language.whichStop}?`);
            collector.once("collect", message => {
              ocService
                .getAllDeparturesByStop(message.content)
                .then(response => {
                  let tripList = `**${language.stopNumber}** ${response.StopNo}: ${response.StopDescription}\n`;
                  if (Array.isArray(response.Routes.Route)) {
                    response.Routes.Route.forEach(trip => {
                      tripList += prettyPrintTripsAllRoutes(trip, language);
                    });
                  } else {
                    tripList += `${language.noOutgoingStop}`;
                  }
                  message.channel.send(tripList + "\n");
                })
                .catch(err => {
                  console.log(err.message);
                  message.channel.send(language.noOutgoingStop);
                });
            });
            break;
          /** Get routes for any stop **/
          case 4:
            message.channel.send(`${language.whichStop}?`);
            collector.once("collect", message => {
              let stop = message.content;
              ocService.getRoutesByStop(stop).then(response => {
                let stopList = "";
                response.forEach(stop => {
                  stopList += prettyPrintStopInfo(stop, language) + "\n";
                });
                message.channel.send(stopList);
              });
            });
            break;

          /** 4. Get next 3 departures for any route at any stop **/
          case 5:
            // Ask for route number
            message.channel.send(`${language.whichRoute}?`);
            collector.once("collect", message => {
              let route = message.content;
              // Ask for stop number
              message.channel.send(`${language.whichStop}?`);
              collector.once("collect", message => {
                let stop = message.content;
                ocService
                  .getDeparturesByStop(stop, route)
                  .then(response => {
                    let tripList = "";
                    if (Array.isArray(response)) {
                      response.forEach(trip => {
                        tripList += prettyPrintTrips(trip, language);
                      });
                    } else {
                      tripList += language.noOutgoing;
                    }
                    message.channel.send(tripList + "\n");
                  })
                  .catch(err => {
                    message.channel.send(err.message);
                  });
              });
            });
            break;

          default:
            message.channel.send(
              `${language.sorry}, "${message.content}" ${language.notValid}`
            );
            break;
        } //end switch
      }); // end menu choice
    }); // end languageChoice
  } // end of bot accepted message
}); // end of client recieving message event

// Event handlers for connection state
client.on("ready", () => {
  client.user.setActivity("Type • Tapez !OC", {
    type: "PLAYING"
  });
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on("reconnecting", () => {
  console.log(`${client.user.tag} is reconnecting`);
});
client.on("disconnect", () => {
  console.log(`${client.user.tag} is disconnected`);
});

// Create connection to Discord API
client.login(token);
