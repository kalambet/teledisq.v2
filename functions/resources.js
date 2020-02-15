const functions = require('firebase-functions');

module.exports = {
    config: {
        telegram: { 
            host: 'api.telegram.org',
            port: 443,
            path: '/bot' + functions.config().teledisq.robotoken,
            headers: {
                'content-type': 'application/json',
                'accept': 'application/json'
            }
        },
        secret: functions.config().teledisq.secret,
        base: functions.config().teledisq.base,
        admin: functions.config().teledisq.admin,
        mainFeed: functions.config().teledisq.mainfeed
    },
    constants: {
        header: {
            event: 'x-discourse-event',
            event_type: 'x-discourse-event-type',
            signature: 'x-discourse-event-signature',
            instance: 'x-discourse-instance'
        },
        events: {
            post: {
                created: {
                    name: 'post_created',
                    text: '📋 <b>%s</b> написал новый пост ↓ в тему <b>%s</b>:\n<code>---</code>\n%s\n<code>---</code>\nLink: %s',
                },
                edited: {
                    name: 'post_edited',
                    text: '✏️ <b>%s</b> обновил пост ↓ в тему <b>%s</b>:\n<code>---</code>\n%s\n<code>---</code>\nLink: %s',
                }
            },
            default: {
                text: functions.config().teledisq.admin + ', что-то не так',
                button: 'Написать'
            }
        },
        misc: {
            button: 'Посмотреть'
        }
    }
}
