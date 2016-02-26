var express = require('express');
var router = express.Router();
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var secret = 'snomedctlogin';
var mongoose = require('mongoose');
var User = mongoose.model('User');
var BSON = require('mongodb').BSONPure;

// TEST: curl -v -d "username=bob&password=secret" http://127.0.0.1:3001/users/login
// curl http://127.0.0.1:3001/users/authenticate?access_token=123456789

var usersTokens = [
    { id: 1, username: 'bob', token: '123456789', email: 'bob@example.com' }
    , { id: 2, username: 'joe', token: 'abcdefghi', email: 'joe@example.com' }
];

function findByToken(token, fn) {
    for (var i = 0, len = usersTokens.length; i < len; i++) {
        var user = usersTokens[i];
        if (user.token === token) {
            return fn(null, user);
        }
    }
    return fn(null, null);
}

passport.use(new BearerStrategy({
    },
    function(token, done) {
        process.nextTick(function () {
            User.findOne({ token: token }, function(err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
                return done(null, user);
            });
        });
    }
));

passport.use(new LocalStrategy(function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        user.comparePassword(password, function(err, isMatch) {
            if (err) return done(err);
            if(isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid password' });
            }
        });
    });
}));

//Passport example ****************
//var User = mongoose.model('User');
//var user = new User({ username: 'bob', email: 'bob@example.com', password: 'secret' });
//user.save(function(err) {
//    if(err) {
//        console.log(err);
//    } else {
//        console.log('user: ' + user.username + " saved.");
//    }
//});

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

var rand = function() {
    return Math.random().toString(36).substr(2); // remove `0.`
};

var token = function() {
    return rand() + rand(); // to make it longer
};

router.get('/authenticate',
    // Authenticate using HTTP Bearer credentials, with session support disabled.
    passport.authenticate('bearer', { session: false }),
    function(req, res){
        res.json({ username: req.user.username, email: req.user.email }, 200);
    });

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err) }
        if (!user) {
            return res.send("Unauthorized", 401);
        }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            //console.log(user._id);
            //var obj_id = BSON.ObjectID.createFromHexString(user._id);
            var newToken = token();
            User.findByIdAndUpdate({_id: user._id}, {$set: {token: newToken}},{safe: true, upsert: false}, function(err, obj){
                if(err){
                    res.end('Update token error ', 500);
                }
                res.send({token: newToken, email: obj.email}, 200);
            });
        });
    })(req, res, next);
});

router.get('/logout', function(req, res){
    req.logout();
    res.send("logged out", 200);
});

router.post('/register', function(req, res) {
    var user = new User(req.body);
    user.save(function(err) {
        if(err) {
            res.end('Database error', 500);
        } else {
            res.end('User created', 200);
        }
    });
});

router.put('/:id', function(req, res) {
    var user = new User(req.body);
    var obj_id = BSON.ObjectID.createFromHexString(req.params.id);
    if (user._id != req.params.id) {
        res.end('Ids do not match!', 400);
    } else {
        User.findByIdAndUpdate({_id: obj_id}, {$set: {password: user.password}},{safe: true, upsert: false}, function(err, obj){
            if(err){
                res.end('Database error', 500);
            }
            res.end('Update complete', 200);
        });
    }
});



module.exports = router;
