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

function login_user(grantor) {
    // TODO: implement
}

function link_user(grantor) {
    // TODO: implement
}

function register_user(profile_data) {
    const email = profile_data.email;
    const first_name = profile_data.first_name;
    const last_name = profile_data.last_name;
    // TODO: implement
}

app.get('/', function (req, res) {
    res.redirect('index.html');
});

app.all(/(.*)\/logout/, function (req, res) {
    // TODO: logout user session
    res.redirect('index.html');
});

app.all(/(.*)\/ajax/, function (req, res) {
    if (req.xhr) {
        console.log(req.body);
        if (req.body.operation === 'getSessionState') {
            gbm.get_token_state(req.body.token, function (error, response, body) {
                if (error || !body) {
                    res.json({success: false});
                }
                console.log(body);
                if (body.status === 3) {
                    login_user(body.grantor);
                    body.grantor = null;
                    delete body.grantor;
                }
                res.json(body);
            }, req.ip, null);
        } else if (req.body.operation === 'getSessionToken') {
            gbm.get_session_token(function (error, response, body) {
                if (error || !body) {
                    res.json({success: false});
                }
                console.log(body);
                res.json(body);
            }, req.ip, null);
        } else if (req.body.operation === 'getAccountState') {
            gbm.get_token_state(req.body.token, function (error, response, body) {
                if (error || !body) {
                    res.json({success: false});
                }
                console.log(body);
                if (body.status === 3) {
                    const grantor = gbm.crypto.random_string(128);
                    gbm.link_account(req.body.token, grantor, function (link_error, link_response, link_body) {
                        link_user(grantor);
                        res.json(body);
                    }, req.ip, null);
                } else {
                    res.json(body);
                }
            }, req.ip, null);
        } else if (req.body.operation === 'getAccountToken') {
            gbm.get_account_token(function (error, response, body) {
                if (error || !body) {
                    res.json({success: false});
                }
                console.log(body);
                res.json(body);
            }, req.ip, null);
        } else if (req.body.operation === 'getRegisterState') {
            gbm.get_token_state(req.body.token, function (error, response, body) {
                if (error || !body) {
                    res.json({success: false});
                }
                console.log(body);
                if (body.status === 3) {
                    const grantor = gbm.crypto.random_string(128);
                    gbm.link_account(req.body.token, grantor, function (link_error, link_response, link_body) {
                        register_user(body.data);
                        res.json(body);
                    }, req.ip, null);
                } else {
                    res.json(body);
                }
            }, req.ip, null);
        } else if (req.body.operation === 'getRegisterToken') {
            gbm.get_register_token(function (error, response, body) {
                if (error || !body) {
                    res.json({success: false});
                }
                console.log(body);
                res.json(body);
            }, req.ip, null);
        }
    } else {
        res.json({success: false});
    }
});

app.post(/(.*)\/callback/, function (req, res) {
    if(req.body.signature && req.body.payload && req.body.message) {
        const cipher_request = {
            'signature': request.body.signature,
            'payload': request.body.payload,
            'message': request.body.message
        };
        const plain_request = gbm.crypto.decrypt(cipher_request);
        if(plain_request && plain_request.operation) {
            if(plain_request.operation === 'ping') {
                // pass
            } else if(plain_request.operation === 'deactivate_service') {
                // TODO: implement
            } else if(plain_request.operation === 'rekey_service') {
                // TODO: implement
            } else if(plain_request.operation === 'deactivate_account') {
                const token = plain_request.token; // sha512(grantor) hash
                // TODO: implement
            } else if(plain_request.operation === 'rekey_account') {
                const token = plain_request.token; // sha512(grantor) hash
                // TODO: implement
            } else {
                res.json({success: false});
            }
            res.json({success: true});
        }
    }
    res.json({success: false});
});

app.listen(5006, function () {
    console.log('serving at port 5006');
});
