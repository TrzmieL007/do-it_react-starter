/**
 * Created by trzmiel007 on 22/08/16.
 */

var log;
function SocketContainer(){
    this.sockets = {};
    this.sessions = {};

    return {
        addSession : function(session, socket){
            return this.sessions[session.id] = { socket : socket, session : session, sessionId : session.id };
        }.bind(this),
        getSocketBySessionId : function(sessionId){
            return this.sessions[sessionId] ? this.sessions[sessionId].socket : {};
        }.bind(this),
        getAllSessions : function(object) {
            return object ? this.sessions : Object.keys(this.sessions).map(function(sessionId){
                return this.sessions[sessionId].session;
            }, this);
        }.bind(this),
        removeSession : function(sessionId){
            return delete this.session[sessionId];
        }.bind(this),

        addClient : function(clientId, socket){
            return this.sockets[clientId] = { client: clientId, socket: socket };
        }.bind(this),
        getSocketByClientId : function(clientId){
            return this.sockets[clientId] ? this.sockets[clientId].socket : null;
        }.bind(this),
        setNewClientId : function(oldId, newId){
            this.sockets[newId] = { client: newId, socket: this.sockets[oldId].socket };
            delete this.sockets[oldId];
            return this.socket[newId];
        }.bind(this),
        getAllClients : function(object){
            return object ? this.sockets : Object.keys(this.sockets);
        }.bind(this),
        removeClient : function(clientId){
            return delete this.sockets[clientId];
        }.bind(this),

        getAllSockets : function(){
            return Object.keys(this.sockets).map(function(clientId){
                return this.sockets[clientId].socket;
            }, this);
        }.bind(this)
    };
}

module.exports = function(config, logger, httpServer){
    log = logger;
    var socketContainer = new SocketContainer();
    var wsManager = {
        socketContainer : socketContainer,
        sendMessage : function(socket, message){
            if(!socket || !message) return false;
            return socket.readyState === 1 ? socket.send(JSON.stringify(message))
                : setTimeout(this.sendMessage.bind(this,socket,message), 512);
        },
        sendMessageToEverybody: function(message){
            if(!message) return false;
            socketContainer.getAllSockets().forEach(function(socket){
                this.sendMessage(socket,message);
            },this);
        },
        sendMessageToClient : function(clientId, message){
            return this.sendMessage(socketContainer.getSocketByClientId(clientId), message);
        },
        sendMesageToSession : function(session, message){
            return this.sendMessage(
                socketContainer.getSocketBySessionId(
                    session.hasOwnProperty("id") ? session.id : session
                ),
                message
            );
        },
        sendKeepAlive : function(session){
            if(!session){
                return false;
            }
            var socket = socketContainer.getSocketBySessionId(session.hasOwnProperty("id") ? session.id : session);
            // if( session expired ){
                // return socket.close(1000, "session_expired");
        },
        hasClientRegistered : function(clientId){
            return socketContainer.getAllClients().some(function(c){ return c == clientId; });
        }
    };
    var connect = function(type){
        var ws = require("ws").Server({ server : httpServer[type] });
        ws.on("connection", function(socket){
            logger.debug('WebSocket connection opened on '+type);
            var req = socket.upgradeReq;
            var client = decodeURIComponent(req.headers.cookie.replace(new RegExp("(?:(?:^|.*;\\s*)connect.sid\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1"));
            // console.log('cookies from app',req.cookies);
            // var interval = setInterval(function(){
            // //     wsManager.sendKeepAlive(req.session);
            //     wsManager.sendMessage(socket,"Hello it is "+(new Date()).toLocaleTimeString()+" now :)");
            // },config.keepAliveInterval);
            socketContainer.addClient(client, socket);

            socket.on("message", function(message){
                //console.log(arguments);
                console.log('WSWSWSWSWSWSWSWSWS=> message: '+JSON.stringify(message,null,2));
                console.log('Some message handler / disposer should be invoked here...');
            });
            socket.on("erorr", function(error){ logger.log('error','WebSocket error: ',error); });
            socket.on("close", function(){
                // clearInterval(interval);
                socketContainer.removeClient(client);
            });

            // wsManager.sendMessage(socket,req.headers['sec-websocket-key']);
        });
    };
    if(httpServer.http){ connect('http'); }
    if(httpServer.https){ connect('https'); }

    // Here we can set a function running in an interval to send keep alive to all sockets

    return wsManager;
};