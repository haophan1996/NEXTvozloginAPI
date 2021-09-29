import { stringify } from "querystring";
import request from "request";

import { json, Router } from "express";
const api2 = Router();

export default api2;

api2.post('/api/verification', async (req, res) => {
    await getVerification(req.body, function (callback) {
        if (callback['status'] == 'ok') {
            console.log(callback['data']);
            if (callback['data'].length == 2) {
                res.status(200).send({
                    cookie: callback['data'][0].split(';')[0] + '; ' + callback['data'][1].split(';')[0] + '; '
                    // xf_user: callback['data'][0].split(';')[0].split('=')[1],
                    // date_expire: callback['data'][0].split(';')[1].split(',')[1].trim(),
                    // xf_session: callback['data'][1].split(';')[0].split('=')[1],
                });
            } else if (callback['data'].length == 3) {
                res.status(200).send({
                    cookie: callback['data'][0].split(';')[0] + '; ' + callback['data'][1].split(';')[0] + '; ' + callback['data'][2].split(';')[0] + ';',
                    // xf_user: callback['data'][1].split(';')[0].split('=')[1],
                    // date_expire: callback['data'][1].split(';')[1].split(',')[1].trim(),
                    // xf_session: callback['data'][2].split(';')[0].split('=')[1],
                });
            } else {
                res.status(400).send({
                    xf_user: 'Refresh page to log or Kill and open again'
                });
            }
        }
        else if (callback['status'] == 'errorGe') {
            res.status(400).send({
                errors: callback['errors']
            });
        } else if (callback['status'] == 'errorSV') {
            res.status(400).send({
                errors: callback['errors']
            });
        } else {
            res.status(400).send({
                errors: callback['errors']
            });
        }
    });
});


 
async function getVerification(bodyUser, callback) {
    console.log(bodyUser);
    let form = {
        code: bodyUser['code'],
        confirm: '1',
        trust: 1,
        provider: bodyUser['provider'],
        remember: '1',
        _xfToken: bodyUser['_xfToken'],
        _xfResponseType: 'json',
    }

    let formData = stringify(form);
    let contentLength = formData.length;

    await request({
        headers: {
            'Content-Length': contentLength,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': bodyUser['xf_session'] + '; ' + bodyUser['xf_csrf'] + ';',
            'User-agent': bodyUser['userAgent'],
            'Host': 'voz.vn',
        },
        uri: 'https://voz.vn/login/two-step',
        body: formData,
        method: 'POST'
    }, async function (error, res, body) {
        if (res.statusCode != 200 && res.statusCode != 303) {
            callback({
                'status': 'errorSV',
                'errors': 'Cannot connect to voz.vn'
            });
        } else {
            let parseBody = JSON.parse(body);
            if (parseBody['status'] == 'error') {
                callback({
                    'status': 'errorGe',
                    'errors': parseBody['errors'][0]
                });
            } else { 
                if (res.headers['set-cookie'] == null) {
                    callback({
                        'status': 'errorSecurity',
                        'errors': 'Refresh page to log or Kill and open again'
                    });
                } else {
                    callback({
                        'status': 'ok',
                        'data': res.headers['set-cookie']
                    });
                }

            }
        }

    });

}