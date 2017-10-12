var builder = require('botbuilder');
var restify = require('restify');
var express = require('express');
var app     = express();

//restify server
var server = restify.createServer();
server.listen(process.env.port || 3978, function(){
    console.log(`server.name:${server.name} | server.url: ${server.url}`);
});

var connector = new builder.ChatConnector({
    appId : process.env.APP_ID,
    appPassword : process.env.APP_PASSWORD
});

server.post('/api/messages', connector.listen());

var menuItems = {
    "AskName" : {
        item : "askName"
    },
    "Reservation" : {
        item : "reservation"
    },
}
var bot = new builder.UniversalBot(connector, [    
    /*function(session){
        session.beginDialog('greetings');
    },
    function(session){
        session.beginDialog('reservation');
    }*/
    function(session)
    {
        session.send("Bonjour !");
        session.beginDialog("mainMenu");
    }
]);

bot.dialog('mainMenu', [
    function(session)
    {
        builder.Prompts.choice(session, "Faites votre choix : ", menuItems);
    },
    function(session, results)
    {
        if(results.response){
            session.beginDialog(menuItems[results.response.entity].item);
        }
    }
])

.triggerAction({
    matches: /^main menu$/i,
    confirmPrompt: "Voulez-vous vraiment retourner au menu ?"
})
.reloadAction(
    "reload", "C'est reparti !",
    {
        matches: /^recommencer$/i,
        confirmPrompt: "Voulez-vous vraiment annuler et recommencer ?" 
    }
)
.cancelAction(
    "cancel", "Taper 'main menu' pour continuer.",
    {
        matches: /^annuler$/i,
        confirmPrompt: "Cela annulera la réservation, êtes-vous sûr ?"
    }
);

bot.dialog('greetings', [
    function(session){
        session.beginDialog('askName');
    },
    function(session, results) {
        session.send(`Bonjour ${(results.response)}`);
        //on appelle directement la deuxième conversation
        session.beginDialog('reservation');
    }
]);

bot.dialog('askName', [
    function(session){
        builder.Prompts.text(session, `Bonjour, comment t'appelles-tu ?`);
    },
    function(session, results){
        session.endDialogWithResult(results);
    }
]);

bot.dialog('reservation', [
    function(session)
    {
        session.send(`Vous pouvez commencer la réservation.`);
        builder.Prompts.time(session, `Pour quelle date voulez-vous une réservation ?`);
    },
    function(session, results)
    {
        session.userData.resDate = builder.EntityRecognizer.resolveTime([results.response]);
        builder.Prompts.number(session, `Pour combien de personne ?`);
    },
    function(session, results)
    {
        var resNbre = results.response;
        session.userData.resNbre = resNbre;
        builder.Prompts.text(session, `Au nom de qui?`);
    },
    function(session, results)
    {
        var resName = results.response;
        session.userData.resName = resName;
        session.send(`Bonjour, pour récapituler : Vous avez fait une réservation pour le "${session.userData.resDate}", pour ${session.userData.resNbre} personnes au nom de ${session.userData.resName}`);
    }
]);