(function() {
    'use strict';

    angular
        .module("admin")
        .controller('gameController', gameController)

        gameController.$inject = ['$scope'];

        function gameController($scope) {
            
            var socket = io();
            var nbplayer = -1;
            var tour = 0;
            var isEnd = false;

            socket.on('newPlayer', function (data) {
                nbplayer = data.nbplayer;
            });

            var c = document.getElementById("myCanvas");
            var ctx = c.getContext("2d");

            // Constante de la Grille récupérer depuis le canvas du fichier index.html
            var width = ctx.canvas.width;
            var height = ctx.canvas.height;

            var echelle = 100;

            // Partie 1 : Initialisation du jeu matrix de jeu
            var grille = [];

            function initMatrix() {
                for(var i  = 0; i < (height/echelle); i++ ) {
                    grille[i] = new Array((width/echelle));
                    for(var j = 0; j < (width/echelle); j++) {
                        grille[i][j] = -1;
                    }
                }
            }

            function drawGrille() {
                initMatrix();
                for(var i  = 0; i < (height/echelle); i++ ) {
                    for(var j = 0; j < (width/echelle); j++) {
                        ctx.moveTo((j*echelle),0);
                        ctx.lineTo((j*echelle),height);
                        ctx.stroke();

                        ctx.moveTo(0,(i*echelle));
                        ctx.lineTo(width,(i*echelle));
                        ctx.stroke();
                    }
                }
            }

            // Partie 2 : Récuperation des positions de la souris
            function getMousePos(event) {
                // Attention j'ai inversé les coordonnées pour obtenir les vraies coordonnées pour la grille[i][j]
                return {
                    i: Math.floor(event.layerY / echelle),
                    j: Math.floor(event.layerX / echelle)
                };
            }

            $scope.mouseEvent = function($event) {
                if(tour %2 == nbplayer && !isEnd) {
                    // On passe son tour à false
                    tour++;

                    var mousePos = getMousePos(event);

                    // On dessine le cercle ici 
                    updateGrille(mousePos.i, mousePos.j);
                    drawCircle();
                    
                    // On verifie ici que le jeu est fini
                    endGame();

                    // On envoie les informations à jours au player suivant
                    sendAction();
                }
            }

            $scope.restartGame = function() {
                drawGrille(); 
            }

            function sendAction() {
                socket.emit('gameAction', { grille: grille, tour: tour, isEnd : isEnd });
                     
                socket.on('gameAction', function (data) {
                    grille = data.grille;
                    drawCircle();
                    tour = data.tour;
                    isEnd = data.isEnd;
                });
            }

            // Partie 4 : Dessiner un cercle à la coordonnée cliquer
            function drawCircle() {
                // Convertion des valeurs de la grille vers celle de la matrice
                for(var i = 0; i < (height/echelle); i++) {
                    for(var j = 0; j< (width/echelle); j++) {
                        // Waring on met à jour les coordonnées de la matrix
                        var cordX = i + 1; var cordY = j +1;
                        switch(grille[i][j]) {
                            case 0:
                                ctx.beginPath();
                                ctx.arc((cordY * echelle - (echelle/2)),(cordX * echelle - (echelle/2)),40,0,2*Math.PI);
                                ctx.fillStyle = 'green';
                                break;
                            case 1:
                                ctx.beginPath();
                                ctx.arc((cordY * echelle - (echelle/2)),(cordX * echelle - (echelle/2)),40,0,2*Math.PI);
                                ctx.fillStyle = 'red';
                                break;
                        }
                        ctx.fill();
                        ctx.stroke();
                    }
                }
            }

            /* cette fonction vérifie la derniere case vide de la colonne */
            function updateGrille(cordX, cordY) {
                //console.log("cordX = " + cordX + " cordY = " + cordY);
                var i = 0;
                for(i = 0; i < (height/echelle); i++) {
                    //console.log("i = " + i);
                    if(grille[i][cordY] == -1) {
                        continue;
                    }
                    console.log("BUG Fatal");
                    if(i < (height/echelle) && i >= 1) {
                       switch(nbplayer) {
                            case 0:
                                grille[i-1][cordY] = 0;
                                break;
                            case 1:
                                grille[i-1][cordY] = 1;
                                break;
                        }
                        break;
                    }
                }
                i = i - 1;
                // la grille n'est plus vide et est de la reference du jouer
                switch(nbplayer) {
                    case 0:
                        grille[i][cordY] = 0;
                        break;
                    case 1:
                        grille[i][cordY] = 1;
                        break;
                }
            }

            // Partie 5 : Verifier que le jeu est fini
            function endGame() {
                verifyLine();
                verifyColumn();
                // verifyDiagonalUp();
                // verifyDiagonalDown();
            }

            function verifyLine() {
                var cpt = 0;
                for(var i  = 0; i < (height/echelle); i++ ) {
                    for(var j = 0; j < (width/echelle); j++) {
                        //alert("cpt = " + cpt);
                        if(grille[i][j] == nbplayer) {
                            cpt++;
                        }else {
                            cpt = 0;
                        }
                        if(cpt == 4){
                            alert("FIN DU  JEU Vainqueur = Player " + (nbplayer+1) );
                            isEnd = true;
                        }
                    }
                }
            }

            function verifyColumn() {
                // Ici nous effectuons une recherche en colonne, il est normal d'inverser la boucle de parcours.
                var cpt = 0;
                for(var j  = 0; j < (width/echelle); j++ ) {
                    for(var i= 0; i < (height/echelle); i++) {
                        if(grille[i][j] == nbplayer) {
                            cpt++;
                        }else {
                            cpt = 0;
                        }
                        if(cpt == 4){
                            alert("FIN DU  JEU Vainqueur = Player " + (nbplayer+1) );
                            isEnd = true;
                        }
                    }
                }
            }

            // A faire : verifyDiagonal (Up & Down) 
            // NB : Petite astuce c'est des puissances de 4, il y a deja 4 grilles non gagante
            // function verifyDiagonalUp() {}
            // function verifyDiagonalDown() {}

            // Partie 0 : Appel des fonctions
            sendAction();
            drawGrille();         
        }
})();