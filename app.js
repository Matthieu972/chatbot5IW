var builder = require('botbuilder');
var restify = require('restify');

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

var bot = new builder.UniversalBot(connector, function(session){    

    


    bot.on('typing', function(){
        session.send(`ahahaaa, t'es en train d'écrire`);
    });

    session.send(`OK ça roule ma poule !! | [Message.length = ${session.message.text.length}]`);
    session.send(`DialogData = ${JSON.stringify(session.dialogData)}`);
    session.send(`OK ça roule ma poule !! | [Message.length = ${JSON.stringify(session.sessionState)}]`);    
});

