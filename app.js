// Tout d'abbord on initialise notre application avec le framework Express 
// et la bibliothèque http integrée à node.
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


// On gère les requêtes HTTP des utilisateurs en leur renvoyant les fichiers du dossier 'public'
app.use("/", express.static(__dirname + "/public"));


// On lance le serveur en écoutant les connexions arrivant sur le port 3000
var port = process.env.PORT || 3001;
http.listen(port, function(){
  console.log('Server is listening on *:3001');
});

/* Connection events */
var nbPlayer = -1;

io.on('connection', function(socket){
	console.log('User connected');
	if(nbPlayer < 2)
		nbPlayer++;

	// On envoie le nouveau joueur
	socket.emit('newPlayer', { nbplayer: nbPlayer });

	socket.on('gameAction', function(data){
		console.log(data); // Ici Data = grille
		//On broadcast la grille à tous les joueurs - NB : Je sais pas pk ça marche pas pour les 2 premières transaction
		socket.broadcast.emit('gameAction', data);
	});


	socket.on('disconnect', function() {
      	console.log('Got disconnect!');
      	nbPlayer = -1;
      	//socket.emit('newPlayer', { nbplayer: nbPlayer });
      	socket.disconnect(true);
   });
});