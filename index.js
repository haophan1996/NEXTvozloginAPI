import querystring from 'querystring'
import request from 'request'
import express, { json } from 'express'

import api from './api/login.js';
import api2 from './api/verification.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(json());
app.use(api,api2); 

app.get('/', (req, res)=>{
    res.send('Server running on port ' + port);
});


const server = app.listen(port, ()=>{
    console.log('Welcome to my second API | Server running on port '+ port)
});