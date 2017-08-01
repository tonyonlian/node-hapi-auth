var Hapi = require('hapi');
var Good = require('good');//日志插件
var Vision = require('vision');//视图插件
var Handlebars = require('handlebars'); //视图引擎
var CookieAuth = require('hapi-auth-cookie'); //权限插件
var User = require('./users-db');


var server = new Hapi.Server();
//connection 
server.connection({
    host: 'localhost',
    port: 7000
});

//register plugin

server.register([{
    register: CookieAuth
},
{
    register: Vision
},
{
    register: Good,
    options: {
        ops: {
            interval: 10000
        },
        reporters: {
            console: [
                {
                    module: 'good-squeeze',
                    name: 'Squeeze',
                    args: [{ log: '*', response: '*', request: '*' }]
                },
                {
                    module: 'good-console'
                },
                'stdout'
            ]
        }
    }
}

], function (err) {
    if (err) {
        console.log("the plugins register error!");
        throw err
    }

    server.log('info', 'the plugins register completed!');

    //view config
    server.views({
        engines: {
            html: Handlebars
        },
        path: __dirname + '/views',
        layout: true
    });

    server.log('info', 'View configuration completed!');

    //auth strategy
    var validation = function (request, session, callback) {
        var account = session.email;
        var user = User[account];
        if (!user) {
            return callback(null, false);
        }
        server.log('info', 'user authenticated');
        callback(err, true, user);

    }
    server.auth.strategy('session', 'cookie', true, {
        password: 'm!*"2/),p4:xDs%KEgVr7;e#85Ah^WYC',
        cookie: 'future-studio-hapi-tutorials-cookie-auth-example',
        isSecure: false,
        redirectTo: '/',
        validateFunc: validation
    });
    server.log('info', 'Registered auth strategy:cookie ahth');

    //set route
    var routes = require('./router');
    server.route(routes);
    server.log('info', 'Routes registered');

    //start server
    server.start(function (err) {
        if (err) {
            throw err
        }
        console.log('Server runing at:' + server.info.uri);
    });


});



