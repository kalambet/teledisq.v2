const https = require('https');
const util = require('util');
const resources = require('./resources');

module.exports = {
    sendMessage: function(message) { 
        let options = Object.assign({}, resources.config.telegram);
        options.method = 'POST';
        options.path += '/sendMessage';
    
        console.log('Options: \n' + util.inspect(options, {depth: 5}));
    
        return new Promise((resolve, reject) => {
            let req = https.request(options, (res) => {          
                let body = [];
                res.setEncoding('utf8');
                res.on('data', (d) => {
                    body.push(Buffer.from(d));
                });
                res.on('end', () => {
                    try {
                        let raw = Buffer.concat(body).toString();
                        if (res.statusCode < 200 || res.statusCode >= 300) {
                            reject(new Error('statusCode=' + res.statusCode + ' error: ' + raw));
                            return;
                        }
                        
                        console.log("Body: " + body);
                        body = JSON.parse(raw);
                    } catch (e) {
                        reject(e);
                    }
                    resolve(body);
                });
            });
    
            req.on('error', (e) => {
                reject(e);
            });
            req.write(JSON.stringify(message));
            req.end();
        });
    }
};
