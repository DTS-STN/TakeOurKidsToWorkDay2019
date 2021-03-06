const axios = require("axios");
require("dotenv").config();

const appId = process.env.OC_APP_ID || "";
const apiKey = process.env.OC_APP_KEY || "";

function getRoutesByStop(stopNumber) {
  console.log("Calling in getRoutesByStop");

  return axios
    .get(
      `https://api.octranspo1.com/v1.3/GetRouteSummaryForStop?appID=${appId}&apiKey=${apiKey}&stopNo=${stopNumber}&format=JSON`
    )
    .then(response => {
      console.log("Data recieved in getRoutesByStop");

      return response.data.GetRouteSummaryForStopResult.Routes.Route;
    })
    .catch(err => {
      console.log(err.message);
    });
}

function getDeparturesByStop(stopNumber, routeNumber) {
  console.log("Calling in getDeparturesByStop");

  return axios
    .get(
      `https://api.octranspo1.com/v1.3/GetNextTripsForStop?appID=${appId}&apiKey=${apiKey}&stopNo=${stopNumber}&routeNo=${routeNumber}&format=JSON`
    )
    .then(response => {
      console.log("Data recieved in getDeparturesByStop");
      return response.data.GetNextTripsForStopResult.Route.RouteDirection;
    })
    .catch(err => {
      console.log(err.message);
    });
}

function getAllDeparturesByStop(stopNumber) {
  console.log("Calling in getAllDeparturesByStop");
  return axios
    .get(
      `https://api.octranspo1.com/v1.3/GetNextTripsForStopAllRoutes?appID=${appId}&apiKey=${apiKey}&stopNo=${stopNumber}&format=JSON`
    )
    .then(response => {
      console.log("Data recieved in getAllDeparturesByStop");
      return response.data.GetRouteSummaryForStopResult;
    })
    .catch(err => {
      console.log(err.message);
    });
}

module.exports = {
  getRoutesByStop,
  getDeparturesByStop,
  getAllDeparturesByStop
};
