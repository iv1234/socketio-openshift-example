var Config = {
  // Contents of this file will be send to the client
  "domain":     process.env.OPENSHIFT_APP_DNS || 'test3-hicc.a3c1.starter-us-west-1.openshiftapps.com',

  "serverip":   process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
  "serverport": process.env.OPENSHIFT_NODEJS_PORT || '8080',
  
  "clientport": (process.env.OPENSHIFT_NODEJS_PORT) ? '8080':'8080',
  "protocol":   'ws://',

  "heartbeattmo": 30000, // milliseconds 
  
  "wsclientopts": { reconnection: true, 
                    reconnectionDelay: 2000,
                    reconnectionAttempts: 100,
                    secure: false
                  }
};

module.exports = Config;

