/**
    * CORE MODULE
    * @namespace Modules
    * @desc Module principale de sayon-shopping Admin
*/

(function() {
    'use strict';

    angular
        .module("admin", [
        ])
        .run(runBlock)
        .config(configure);

        runBlock.$inject = [];
        configure.$inject = [];


        function runBlock() {
            var socket = io();

            socket.on('connect', function() {
                socket.on('newPlayer', function (data) {
                    console.log(data.nbplayer);
                    switch(data.nbplayer) {
                        case 0:
                            alert("Player 1 - Connected");
                            break;
                        case 1:
                            alert("Player 2 - Connected");
                            break;
                        default:
                            alert("Maximum Player")
                            break;
                    }
                });
                console.log("Nouvelle connection utilisateur");
            });
        }

        function configure() {
            
        }

})();