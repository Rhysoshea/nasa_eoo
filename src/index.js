const express = require('express');
const app = express();
const db = require('./persistence');
const getNames = require('./routes/getNames');
const getItems = require('./routes/getItems');
const getItem = require('./routes/getItem');

app.use(require('body-parser').json());
app.use(express.static(__dirname + '/static'));


app.route('/names')
    .get(getNames);

app.route('/items')
    .get(getItems);

app.route('/items/:name')
    .post(getItem);


db.init().then(() => {
    app.listen(3000, () => console.log('Listening on port 3000'));
}).catch((err) => {
    console.error(err);
    process.exit(1);
});

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
