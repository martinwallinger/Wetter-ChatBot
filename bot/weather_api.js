var request = require('request');


const api_url = "https://api.weatherapi.com/v1/"
const api_key = "a6c29657612b466f85c150744222705"

/**
 * Klasse die den Call weiterleitet
 */

class api {

    constructor() {

    }

    getCurrent(city, time, botter) {
        if (time == "Durchschnittstemperatur" || time == "Jetzt"){
            request(api_url + "current.json?key=" + api_key + "&q=" + city + "&aqi=no&lang=de", function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    var msg = JSON.parse(body)
                    var answer = "Wetter in " + city + ": " + msg.current.condition.text + ", bei " + msg.current.temp_c + "°C"
                    console.log("transmitted by api: " + answer)
                    botter.transmit(answer)
                    return
                }
                if (!error && response.statusCode === 400) {
                    var msg = JSON.parse(body)
                    var answer = "Error: " + msg.error.message
                    console.log("transmitted by api: " + answer)
                    botter.transmit(answer)
                    return
                }
                if (!error && response.statusCode === 403) {
                    var msg = JSON.parse(body)
                    var answer = "Error: API key has exceeded calls per month quota or has been disabled."
                    console.log("transmitted by api: " + answer)
                    botter.transmit(answer)
                    return
                }
                botter.transmit("Uncaught API-Error: Please check your network connection.")
            }) 
            return
        } else {
            var days_in_future = "1"
            request(api_url + "forecast.json?key=" + api_key + "&q=" + city + "&days=" + days_in_future + "&aqi=no&alerts=no&lang=de", function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    var msg = JSON.parse(body)
                    time = parseInt(time)
                    var answer = "Wetter in "+city+", Heute um "+time+" Uhr: " + msg.forecast.forecastday[0].hour[time].condition.text + ", bei " +
                    msg.forecast.forecastday[0].hour[time].temp_c + "°C"
                    botter.transmit(answer)
                    return
                }
                if (!error && response.statusCode === 400) {
                    var msg = JSON.parse(body)
                    var answer = "Error: " + msg.error.message
                    console.log("transmitted by api: " + answer)
                    botter.transmit(answer)
                    return
                }
                if (!error && response.statusCode === 403) {
                    var msg = JSON.parse(body)
                    var answer = "Error: API key has exceeded calls per month quota or has been disabled."
                    console.log("transmitted by api: " + answer)
                    botter.transmit(answer)
                    return
                }
                botter.transmit("Uncaught API-Error: Please check your network connection.")
            })
        }
    }


    getForecast(city, days_in_future, time, botter) { 
        days_in_future = parseInt(days_in_future)+1
        request(api_url + "forecast.json?key=" + api_key + "&q=" + city + "&days=" + days_in_future + "&aqi=no&alerts=no&lang=de", function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var msg = JSON.parse(body)
                if (time == "Durchschnittstemperatur" || time == "Jetzt"){
                    var answer = "Wetter in " + city + " in " + (days_in_future-1) + " Tagen: " + msg.forecast.forecastday[0].day.condition.text + ", bei " +
                     msg.forecast.forecastday[0].day.avgtemp_c + "°C"
                    botter.transmit(answer)
                    return
                }
                else {
                    time = parseInt(time)
                    var answer = "Wetter in "+city+" in "+(days_in_future-1)+" Tagen, um "+time+" Uhr: " + msg.forecast.forecastday[0].hour[time].condition.text + ", bei " +
                    msg.forecast.forecastday[0].hour[time].temp_c + "°C"
                    botter.transmit(answer)
                    return
                }
            }
            if (!error && response.statusCode === 400) {
                var msg = JSON.parse(body)
                var answer = "Error: " + msg.error.message
                console.log("transmitted by api: " + answer)
                botter.transmit(answer)
                return
            }
            if (!error && response.statusCode === 403) {
                var msg = JSON.parse(body)
                var answer = "Error: API key has exceeded calls per month quota or has been disabled."
                console.log("transmitted by api: " + answer)
                botter.transmit(answer)
                return
            }
            botter.transmit("Uncaught API-Error: Please check your network connection.")
        })
    }
}

module.exports = api