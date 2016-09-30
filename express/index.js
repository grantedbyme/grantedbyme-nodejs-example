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

var fs = require('fs');
var path = require('path');
var util = require('util');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

console.log(path.join(__dirname, 'logs/app.log'));
var log_stream = fs.createWriteStream(path.join(__dirname, 'logs/app.log'), {flags: 'a'});
var log_stdout = process.stdout;

console.log = function(d) { //
    log_stream.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
};

function login_user(authenticator_secret) {
    console.log('login_user');
    // TODO: implement
}

function link_user(authenticator_secret) {
    console.log('link_user');
    // TODO: implement
}

function register_user(profile_data) {
    console.log('register_user');
    const email = profile_data.email;
    const first_name = profile_data.first_name;
    const last_name = profile_data.last_name;
    // TODO: implement
}

app.get('/', function (req, res) {
    // TODO: check logged in user and redirect to index.html
    res.redirect('login.html');
});

app.all(/(.*)\/logout/, function (req, res) {
    // TODO: logout user session
    res.redirect('login.html');
});

app.all(/(.*)\/ajax/, function (req, res) {
    if (req.xhr) {
        console.log('ajax request', req.body);
        if (req.body.operation === 'getChallenge') {
            gbm.get_challenge(parseInt(req.body.challenge_type), function (error, response, body) {
                if (error || !body) {
                    res.json({success: false});
                }
                console.log(body);
                res.json(body);
            }, req.ip, null);
        } else if (req.body.operation === 'getChallengeState') {
            gbm.get_challenge_state(req.body.challenge, function (error, response, body) {
                if (error || !body) {
                    res.json({success: false});
                }
                console.log(body);
                if (body.status === 3) {
                    if(parseInt(req.body.challenge_type) === gbm.CHALLENGE_AUTHORIZE) {
                        const authenticator_secret = gbm.generate_authenticator_secret();
                        gbm.link_account(req.body.challenge, authenticator_secret, function (link_error, link_response, link_body) {
                            link_user(authenticator_secret);
                            res.json(body);
                        });
                    } else if(parseInt(req.body.challenge_type) === gbm.CHALLENGE_AUTHENTICATE) {
                        login_user(body.authenticator_secret);
                        body.authenticator_secret = null;
                        delete body.authenticator_secret;
                    } else if(parseInt(req.body.challenge_type) === gbm.CHALLENGE_PROFILE) {
                        const authenticator_secret = gbm.generate_authenticator_secret();
                        gbm.link_account(req.body.challenge, authenticator_secret, function (link_error, link_response, link_body) {
                            register_user(body.data);
                            res.json(body);
                        });
                    }
                }
                res.json(body);
            }, req.ip, null);
        }
    } else {
        res.json({success: false});
    }
});

app.post(/(.*)\/callback/, function (req, res) {
    var result = {success: false};
    if(req.body.signature && req.body.payload) {
        const cipher_request = {
            'signature': req.body.signature,
            'payload': req.body.payload
        };
        if(req.body.message) {
            cipher_request['message'] = req.body.message;
        }
        const plain_request = gbm.crypto.decrypt(cipher_request);
        console.log('callback request', plain_request);
        if(plain_request && plain_request.operation) {
            var token;
            if(plain_request.operation === 'ping') {
                result = {success: true};
            } else if(plain_request.operation === 'unlink_account') {
                if(plain_request.authenticator_secret_hash) {
                    // TODO: implement
                }
            } else if(plain_request.operation === 'rekey_account') {
                if(plain_request.authenticator_secret_hash) {
                    // TODO: implement
                }
            } else if(plain_request.operation === 'revoke_challenge') {
                if(plain_request.challenge) {
                    // TODO: implement
                }
            } else {
                console.log('callback operation not handled:', plain_request.operation);
            }
            result = gbm.crypto.encrypt(result);
        }
    }
    console.log('callback response', result);
    res.json(result);
});

app.listen(5006, function () {
    console.log('serving at port 5006');
});
