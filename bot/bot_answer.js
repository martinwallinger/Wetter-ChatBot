var cities = require('./bot_data/cities.json')
const fs = require('fs');
var possible_days = require('./bot_data/possible _days.json')
var possible_times = require('./bot_data/possible_times.json')
var smalltalk = require('./bot_data/smalltalk.json')
var api = require('./weather_api.js')
var myApi = new api()
var ask_for_city = ask_city()
var ask_for_day = ask_day()
var ask_for_time = ask_time()


function answer(nachricht, botter) {
    if (nachricht == "reset") {
        reset()
        botter.transmit("Gespeicherte Werte wurden zurückgesetzt!")
    }

    
    var nachricht_upper = nachricht.toUpperCase()

    if (answer_smalltalk(nachricht_upper, botter) == true){
        return
    }

    nachricht_upper = clean_message(nachricht_upper)
    nachricht_upper = nachricht_upper.split(" ")
    


    var temp_city = get_temp_city()
    var temp_day = get_temp_day()
    var temp_time = get_temp_time()

   
    if (temp_city == null) {
        answer = search_city(nachricht_upper, botter)
    }
    temp_city = get_temp_city()
    temp_day = get_temp_day()
    temp_time = get_temp_time()
    if (temp_day == null && temp_city != null && temp_time == null) {
        answer = search_day(nachricht_upper, botter)
    }
    temp_city = get_temp_city()
    temp_time = get_temp_time()
    if (temp_day != null && temp_city != null && temp_time == null){
        answer = search_time(nachricht_upper, botter)
    }
    temp_day = get_temp_day()
    temp_city = get_temp_city()
    temp_time = get_temp_time()
    if (temp_city != null && temp_day != null && temp_time != null) {
        call_api(botter)
    } else if (temp_city != null && temp_day == null) {
        botter.transmit(yield_from_ask_for_day())
    } else if (temp_city != null && temp_day != null){
        botter.transmit(yield_from_ask_for_time())
    }
}
module.exports = answer

function clean_message(message){
    message = message.replace("?", " ")
    message = message.replace("!", " ")
    message = message.replace(".", " ")
    message = message.replace(",", " ")
    message = message.replace("'", " ")
    message = message.replace('"', " ")
    return message
}

function get_temp_city() {
    var json = fs.readFileSync('./bot/bot_data/temp_data.json')
    var data = JSON.parse(json)
    return data.city
}

function get_temp_day() {
    var json = fs.readFileSync('./bot/bot_data/temp_data.json')
    var data = JSON.parse(json)
    return data.day
}

function get_temp_time() {
    var json = fs.readFileSync('./bot/bot_data/temp_data.json')
    var data = JSON.parse(json)
    return data.time
}


function yield_from_ask_for_day() {
    answ = ask_for_day.next().value
    if (answ == undefined) {
        ask_for_day = ask_day()
        answ = ask_for_day.next().value
    }
    return answ
}

function yield_from_ask_for_city() {
    answ = ask_for_city.next().value
    if (answ == undefined) {
        ask_for_city = ask_city()
        answ = ask_for_city.next().value
    }
    return answ
}

function yield_from_ask_for_time() {
    answ = ask_for_time.next().value
    if (answ == undefined) {
        ask_for_time = ask_time()
        answ = ask_for_time.next().value
    }
    return answ
}


function answer_smalltalk(nachricht, botter) {
    for (var answ in smalltalk) {
        for (var i in smalltalk[answ]) {
            if (nachricht.includes(smalltalk[answ][i])) {
                botter.transmit(answ)
                return true  // send "break" statement to main func
            }
        }
    }
    return false
}


function reset() {
    var data = {
        "city": null,
        "day": null, 
        "time": null
    }
    data = JSON.stringify(data)
    fs.writeFileSync('./bot/bot_data/temp_data.json', data)
}

function search_city(nachricht_upper, botter) {
    answer = null
    for (var i in cities) {
        for (var x in nachricht_upper) {
            try{
                if ((nachricht_upper[x]+" "+nachricht_upper[parseInt(x+1)]) === (cities[i].toUpperCase())) {
                    var data = {
                        "city": cities[i],
                        "day": null,
                        "time": null
                    }
                    data = JSON.stringify(data)
                    fs.writeFileSync('./bot/bot_data/temp_data.json', data)
                    answer = "Registriete Stadt: " + cities[i]
                }
            }
            catch(e){
                if (e instanceof RangeError){}
                else{throw e}
            }
            if (nachricht_upper[x].localeCompare(cities[i].toUpperCase()) == 0) {
                var data = {
                    "city": cities[i],
                    "day": null,
                    "time": null
                }
                data = JSON.stringify(data)
                fs.writeFileSync('./bot/bot_data/temp_data.json', data)
                answer = "Registriete Stadt: " + cities[i]
            }
        }
    }
    if (answer == null) {
        botter.transmit(yield_from_ask_for_city())
        return
    }
    botter.transmit(answer)
}


function search_day(nachricht_upper, botter) {
    var temp_city = get_temp_city()
    for (var day in possible_days) {
        for (var i in possible_days[day]) {
            if (nachricht_upper.includes(possible_days[day][i])) {
                var data = {
                    "city": temp_city,
                    "day": parseInt(day),
                    "time": null
                }
                data = JSON.stringify(data)
                fs.writeFileSync('./bot/bot_data/temp_data.json', data)
            }
        }
    }
    var temp_day = get_temp_day()
    if (temp_day == 0) { botter.transmit("Registierter Zeitpunkt: Heute"); return }
    if (temp_day == 1) { botter.transmit("Registierter Zeitpunkt: Morgen"); return }
    if (temp_day == 2) { botter.transmit("Registierter Zeitpunkt: Übermorgen"); return }
}

function search_time(nachricht_upper, botter) {
    var temp_city = get_temp_city()
    var temp_day = get_temp_day()
    for (var time in possible_times) {
        for (var i in possible_times[time]) {
            if (nachricht_upper.includes(possible_times[time][i])) {
                var data = {
                    "city": temp_city,
                    "day": temp_day,
                    "time": time
                }
                data = JSON.stringify(data)
                fs.writeFileSync('./bot/bot_data/temp_data.json', data)
            }
        }
    }
    var temp_time = get_temp_time()
    if (temp_time == "Durchschnittstemperatur" || (temp_day != "0" && temp_time == "Jetzt")){
        botter.transmit("Registierte Uhrzeit: Tagesdurchschnitt")
    } else if (temp_time == "Jetzt"){
        botter.transmit("Registierte Uhrzeit: Aktueller Moment")
    } else if (temp_time != null){
        botter.transmit("Registierte Uhrzeit: "+ temp_time+":00 Uhr")
    }
}

function call_api(botter) {
    var temp_city = get_temp_city()
    var temp_day = get_temp_day()
    var temp_time = get_temp_time() 
    if (temp_day == 0) {
        myApi.getCurrent(temp_city, temp_time, botter)
        inhalt = "Anfrage für '" + temp_city + "' läuft..."
        botter.transmit(inhalt)
        reset()
        return
    } else {
        myApi.getForecast(temp_city, temp_day, temp_time, botter)
        inhalt = "Anfrage für '" + temp_city + "' in " + temp_day + " Tagen läuft..."
        botter.transmit(inhalt)
        reset()
        return
    }
}


function* ask_city() {
    yield* ["Für welche Stadt soll das Wetter angezeigt werden?", "Ich reagiere auf Städtenamen von überall auf der Welt", "Bitte geben Sie eine Stadt an", "Wie kann ich helfen?"]
}

function* ask_day() {
    yield* ["Heute, Morgen oder Übermorgen?", "In wie vielen Tagen?", "Falls Sie die gewählte Stadt ändern möchten, tippen Sie 'reset' ein", "Bitte geben Sie einen Zeitpunkt an"]
}

function* ask_time() {
    yield* ["Welche Uhrzeit?", "Auch der Tagesdurchschnitt ist als Zeitpunkt möglich", "Um wie viel Uhr?", "Bitte geben Sie eine Uhrzeit an", "Falls Sie die registrierten Werte ändern möchten, tippen Sie 'reset' ein"]
}
