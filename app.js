const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');




app.listen(8000 , () =>{
    console.log('Serving on port 8000')
})