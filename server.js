const express    = require('express')
const app        = express();
const httpServer = require('http').Server(app);
const port       = 3001;

httpServer.listen(port);
