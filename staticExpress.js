/* Pakete die wir brauchen */

var bot = require('./bot/bot.js')
var express = require('express')
const fs = require('fs');

var app = express()

/* Nutzen einer statischen WebSeite
*/
app.use(express.static('public'))

// Wir nutzen ein paar statische Ressourcen
app.use('/css', express.static(__dirname + '/public/css'))
app.use('/js', express.static(__dirname + '/public/js'))
app.use('/images', express.static(__dirname + '/public/images'))

// Wir starten den Express server
var server = app.listen(80, function () {
  var port = server.address().port
  console.log('Server started at http://localhost:%s', port)
})

// Das brauchen wir für unsere Websockets
var WSS = require('websocket').server,
  http = require('http')

var websocketserver = http.createServer()
websocketserver.listen(8181)

/* Wir erstellen einen Bot, der kann sich aber noch nicht mit 
    dem Socket Server verbinden, da dieser noch nicht läuft
*/
var myBot = new bot()

// Hier erstellen wir den Server
var wss = new WSS({
  httpServer: websocketserver,
  autoAcceptConnections: false
})

var connections = {}

// Wenn Sich ein client Socket mit dem Server verbinden will kommt er hier an
wss.on('request', function (request) {
  var connection = request.accept('chat', request.origin)

  connection.on('message', function (message) {
    var name = ''

    for (var key in connections) {
      if (connection === connections[key]) {
        name = key
      }
    }
    var data = JSON.parse(message.utf8Data)
    var msg = 'leer'

    // Variablen um später den letzten Satz und den Sender zu speichern
    var uname
    var utype
    var umsg

    switch (data.type) {
      case 'join':
        // Wenn der Typ join ist füge ich den Client einfach unserer Liste hinzu
        connections[data.name] = connection
        msg = '{"type": "join", "names": ["' + Object.keys(connections).join('","') + '"]}'
        if (myBot.connected === false) {
          myBot.connect()
        }
        temp_reset()
        break

      case 'msg':
        // Erstelle eine Nachricht in JSON mit Typ, Sender und Inhalt
        msg = '{"type": "msg", "name": "' + name + '", "msg":"' + data.msg + '"}'
        utype = 'msg'
        uname = name
        umsg = data.msg
        break
    }

    // Sende alle daten an alle verbundenen Sockets
    for (var key in connections) {
      if (connections[key] && connections[key].send) {
        connections[key].send(msg)
      }
    }

    // Leite die Daten des Users an den Bot weiter, damit der antworten kann
    if (uname !== 'Chat-Bot' && utype === 'msg') {
      var test = myBot.post(umsg)
    }
  })
})

function temp_reset() {
  var data = {
    "city": null,
    "day": null,
    "time": null
  }
  data = JSON.stringify(data)
  fs.writeFileSync('./bot/bot_data/temp_data.json', data)
}
