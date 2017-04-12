const express    = require('express');
const path       = require('path');
const app        = express();
const httpServer = require('http').Server(app);
const port       = 3001;

httpServer.listen(port);
app.use(express.static(path.join(__dirname, 'public')));
