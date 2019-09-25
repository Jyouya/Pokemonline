require("dotenv").config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt');
const socket = require('socket.io');
const bindGameEvents = require('./game/bindSocketEvents');
const mongoose = require('mongoose');
const db = require('./models');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/project3');

// app setup
const app = express();
const server = require("http").Server(app);
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//serve up static assets (on heroku)
if (process.env.NODE_ENV === "production") {app.use(express.static('client/build'));} 
else {app.use(express.static('client/public'))}

const LocalStrategy = require('passport-local').Strategy;

app.use(
    session({
        secret: process.env.SESSIONKEY,
        resave: false,
        saveUninitialized: true
    })
);

app.use(passport.initialize());
app.use(passport.session());

require('./routes/api/user')(app, passport, db);

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        function(email, password, done) {
            db.User.findOne({
                email: email
            }).then(function(user) {
                if (!user) {
                    console.log('\n\nuser not found. login failed');
                } else if (user) {

                    //hash here
                    bcrypt.compare(password, user.password, function (req, res){
                        if (res){
                        console.log('\n\nsuccessful login, ' + user.username + '\n\n');
                        return done(null, user);
                        }
                    });

                    // if (password === user.password){
                    //     console.log('\n\nsuccessful login, ' + user.username + '\n\n');
                    //     return done(null, user);
                    // }

                    console.log('\n\nbad password. login failed');
                }
            });
        }
    )
);

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    db.User.findById(id)
        .then(function(user) {
            done(null, user);
        })
        .catch(function(err) {
            done(err);
        });
});

// socket setup
const io = socket(server);

server.listen(PORT, function() {
    console.log('listening to requests on port ' + PORT);
    console.log('http://localhost:' + PORT);
});

// console.log(io)
const connectedUsers = {};
io.on('connection', bindGameEvents(io, connectedUsers));
