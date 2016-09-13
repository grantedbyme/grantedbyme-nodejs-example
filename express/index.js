// load grantedbyme sdk
var grantedbyme;
try {
    grantedbyme = require('./../../lib/grantedbyme');
} catch (err) {
    grantedbyme = require('grantedbyme');
}

const gbm = new grantedbyme({
    'private_key_path': './../../data/private_key.pem',
    'server_key_path': './../../data/server_key.pem'
});

// load and init express.js
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
// app.set('view engine', 'pug');
app.use(express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.all('/logout', function (req, res) {
    // TODO: logout user session
    res.redirect('index.html');
});

app.post('/ajax', function (req, res) {
    if (req.xhr) {
        console.log(req.body);
        if (req.body.operation === 'getSessionState') {
            gbm.get_token_state(req.body.token, function(error, response, body) {
                if(error || !body) {
                    res.json({success: false});
                }
                console.log(body);
                res.json({success: body.success, status: body.status});
            }, req.ip, null);
        } else if (req.body.operation === 'getSessionToken') {
            gbm.get_session_token(function(error, response, body) {
                if(error || !body) {
                    res.json({success: false});
                }
                console.log(body);
                res.json({success: body.success, token: body.token});
            }, req.ip, null);
        } else if (req.body.operation === 'getAccountState') {
            gbm.get_token_state(req.body.token, function(error, response, body) {
                if(error || !body) {
                    res.json({success: false});
                }
                console.log(body);
                res.json({success: body.success, status: body.status});
            }, req.ip, null);
        } else if (req.body.operation === 'getAccountToken') {
            gbm.get_account_token(function(error, response, body) {
                if(error || !body) {
                    res.json({success: false});
                }
                console.log(body);
                res.json({success: body.success, token: body.token});
            }, req.ip, null);
        } else if (req.body.operation === 'getRegisterState') {
            gbm.get_token_state(req.body.token, function(error, response, body) {
                if(error || !body) {
                    res.json({success: false});
                }
                console.log(body);
                res.json({success: body.success, status: body.status});
            }, req.ip, null);
        } else if (req.body.operation === 'getRegisterToken') {
            gbm.get_register_token(function(error, response, body) {
                if(error || !body) {
                    res.json({success: false});
                }
                console.log(body);
                res.json({success: body.success, token: body.token});
            }, req.ip, null);
        }
    } else {
        res.json({success: false});
    }
});

app.post('/callback', function (req, res) {
    // TODO: implement
    res.json({success: false});
});

app.listen(5006, function () {
    console.log('serving at port 5006');
});
