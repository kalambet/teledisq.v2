const functions = require('firebase-functions');
const util = require('util');
const crypto = require('crypto');
const telegram = require('./telegram');
const discourse = require('./discourse');
const resources = require('./resources');

function validatePayload(headers, payload) {
    if (payload === undefined) {
        return false;
    }

    const hmac = crypto.createHmac('sha256', resources.config.secret);
    hmac.update(payload);
    let digest = 'sha256=' + hmac.digest('hex').toString();
    console.log('Computed digest: ' + digest);

    let inputDigest = headers[resources.constants.header.signature];
    console.log('Input digest: ' + inputDigest);

    let cmp = inputDigest.localeCompare(digest);
    if (cmp !== 0) {
        console.log('Error: digests are different (%i)', cmp);
        return false;
    }

    let address = headers[resources.constants.header.instance];
    if (address !== resources.config.base) {
        console.log('Error: base instance are different');
        return false;
    }

    return true;
}

exports.update = functions.https.onRequest((request, response) => {
    if (request.method !== 'POST') { 
        response.status(405).send('Method not allowed');
        return;
    }

    if (!validatePayload(request.headers, request.rawBody.toString())) { 
        response.status(401).send('Unauthorized');
        return;
    }

    let payload = request.body, message = '';

    message = discourse.createMessage(request.headers, payload);
    if (message === null) { 
        console.log('Looks like a message we don\'t need');
        response.status(200).send('OK');
    }

    console.log('Message: \n' + util.inspect(message, {depth: 5}));

    telegram.sendMessage(message).then((body) => {
        console.log('Message successfully sent: ' + body);
        response.status(200).send('OK');
        return;
    }).catch((e) => {
        console.log("Can't send message to telegram: " + e);
        response.status(500).send(e);
    });
});
