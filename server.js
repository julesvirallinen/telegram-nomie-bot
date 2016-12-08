var TelegramBot = require('node-telegram-bot-api')

// require('dotenv').config();
var http = require('http');
var https = require('https');
var cron = require('node-cron')


// replace the value below with the Telegram token you receive from @BotFather
var token = process.env.API_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
var bot = new TelegramBot(token, {polling: true});

bot.onText(/\/echo (.+)/, function (msg, match) {
    chatId = msg.chat.id;
    var resp = match[1];

    bot.sendMessage(chatId, resp)
});

bot.onText(/\/track (.+)/, function (msg, match) {
    var chatId = msg.chat.id;
    var result = nomieTick(match[1].replace(/ /g, '%20'));
    console.log(result);
    bot.sendMessage(chatId, "sent it!");
});

bot.onText(/\/note (.+)/, function (msg, match) {
    var chatId = msg.chat.id;
    var result = nomieTick('/action=create-note/note='+ match[1].replace(/ /g, '%20'));
    bot.sendMessage(chatId, "sent it!");
});

bot.onText(/\/mood/, function (msg, match) {
    // console.log(msg)
    queryMood(msg.chat.id);
});


function nomieTick(trackerParams) {
    nomieRequest('/action=track/label=' + trackerParams)

};

function nomieRequest(params){
    var options = {
        host: 'api.nomie.io',
        path: '/v2/push/' + process.env.NOMIE_API + '/' + params
    };
    callback = function (response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            console.log(str)
            var parsed = JSON.parse(str);
        });
    };
    https.request(options, callback).end();
}

var queryMood = function (id) {
    var options = {
        reply_markup: JSON.stringify({
            inline_keyboard: [[
                {text: '😫', callback_data: 'm-3'},
                {text: '😣', callback_data: 'm-2'},
                {text: '😑', callback_data: 'm-1'},
                {text: '😶', callback_data: 'm0'}],
                [
                    {text: '😌', callback_data: 'm1'},
                    {text: '😊', callback_data: 'm2'},
                    {text: "😀", callback_data: 'm3'},
                    {text: "❌", callback_data: 'n'}
                ],]
        })
    };
    bot.sendMessage(id, 'Hey Julius, how are you feeling right now?', options).then(function (result) {
        // console.log(result)
    });

};

bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    console.log(process.env.JULIUS);


    var tracker = callbackQuery.data.substr(0, 1);
    var value = callbackQuery.data.substr(1);
    console.log(tracker, value);
    console.log(callbackQuery);
    var options = {

        chat_id: callbackQuery.message.chat.id,
        message_id: callbackQuery.message.message_id
    };

    if (tracker == 'm') {
        var params = 'Mood/value=' + value;
        nomieTick(params);
        bot.editMessageText('Set mood to ' + value, options);
    }
    else bot.editMessageText('Ok then, have a good day!', options);


});


function askUserMood(id) {
    queryMood(id);
};

// cron.schedule('0 0 22 * *', askUserMood(process.env.JULIUS));
cron.schedule('0 0 16 * *', askUserMood(process.env.JULIUS));

