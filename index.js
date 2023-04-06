const express = require('express');

const morgan = require('morgan');

const routes = require('./routes');

const PORT_TO_LISTEN = 3000;

const app = express();

app.use(morgan("dev"));

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ 
    "extended": true // for parsing application/x-www-form-urlencoded
}));

app.get('/', (req, res) => {
	res.send('App is working');
});

app.use('/api', routes);

app.listen(PORT_TO_LISTEN, (abc) => {
    console.log(`Listening port: ${PORT_TO_LISTEN}`);
});
