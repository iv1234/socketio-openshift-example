var Config = {
    "serverip": process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    "serverport": process.env.OPENSHIFT_NODEJS_PORT || '8080',
    "heartbeattmo": 500000, // milliseconds 
    "wsclientopts": {
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 100,
        secure: false
    }
};
module.exports = Config;
