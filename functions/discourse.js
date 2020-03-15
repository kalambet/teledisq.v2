const util = require('util');
const TurndownService = require('turndown')
const turndownService = new TurndownService()
const resources = require('./resources'); 

function newUpdateMessage(event, payload) {
    let text = '', inline = '', url = '';
    switch (event) {
        case resources.constants.events.post.created.name:
            url = resources.config.base + '/t/' + payload.post.topic_slug + '/' + payload.post.topic_id + '/' + payload.post.post_number;
            text =
                util.format(
                    resources.constants.events.post.created.text,
                    payload.post.username,
                    payload.post.topic_title,
                    displayableCooked(payload.post.cooked),
                    url
                );
            inline = {
                inline_keyboard: [
                    [{
                        text: resources.constants.misc.button,
                        url: url
                    }]
                ]
            };
            break;
        case resources.constants.events.post.edited.name:
            url = resources.config.base + '/t/' + payload.post.topic_slug + '/' + payload.post.topic_id + '/' + payload.post.post_number;
            text =
                util.format(
                    resources.constants.events.post.edited.text,
                    payload.post.username,
                    payload.post.topic_title,
                    displayableCooked(payload.post.cooked),
                    url
                );
            inline = {
                inline_keyboard: [
                    [{
                        text: resources.constants.misc.button,
                        url: url
                    }]
                ]
            };
            break;
        default:
            text = resources.constants.default.text;
            inline = {
                inline_keyboard: [
                    [{
                        text: resources.constants.default.button,
                        url: 'https://t.me/' + resources.config.admin
                    }]
                ]
            };
            break;
    }
    return {
        chat_id: resources.config.mainFeed,
        disable_notification: true,
        text: text,
        parse_mode: 'MarkdownV2',
        reply_markup: inline
    }
}

function isSystemUpdate(headers, payload) { 
    if (headers[resources.constants.header.event] === resources.constants.events.post.created.name ||
        headers[resources.constants.header.event] === resources.constants.events.post.edited.name) {

        return payload.post === undefined || payload.post.usename === 'system' || payload.post.edit_reason !== null;
    }
    return true;
}

function displayableCooked(cooked) {
    const str = turndownService.turndown(cooked);
    if (str.length > 280) { 
        return str.substring(0, 279) + ' ...'
    }

    return str;
}

module.exports = {
    createMessage: function (headers, payload) {
        if (isSystemUpdate(headers, payload)) {
            return null;
        }

        return newUpdateMessage(headers[resources.constants.header.event], payload);
    }
};
