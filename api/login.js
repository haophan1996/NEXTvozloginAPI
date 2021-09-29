import { stringify } from "querystring";
import request from "request";

import { Router } from "express";
const api = Router();

export default api;

api.post('/api/login', async (req, res) => {
    await getCookieLogin(req.body, function (bodyReturn) {
        if (bodyReturn == 'errorServer') {
            res.status(400).send({
                xf_user: 'Cannot connect to server voz.vn'
            });
        } else if (bodyReturn == 'errorLogin') {
            res.status(400).send({
                xf_user: 'Incorrect password / or id'
            });
        } else {
            if (bodyReturn.length == 2) {
                res.status(200).send({
                    type: 0,
                    cookie: bodyReturn[0].split(';')[0].split('=')[1] + '; ' + bodyReturn[1].split(';')[0].split('=')[1] + ';', 
                });
            } else if (bodyReturn.length == 1) {
                res.status(200).send({
                    type: 1,
                    xf_session: bodyReturn[0].split(';')[0],
                    checkData: bodyReturn[0],
                });
            } else {
                res.status(400).send({
                    xf_user: 'Cant find cookie'
                });
            }
        }
    });
});


async function getCookieLogin(userRequest, callback) {
    let form = {
        login: userRequest['login'],
        password: userRequest['password'],
        remember: 1,
        _xfToken: userRequest['_xfToken'],
    }

    let formData = stringify(form);
    let contentLength = formData.length;


    request({
        headers: {
            'Content-Length': contentLength,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': userRequest['cookie'],
            'User-Agent': userRequest['userAgent'],
            'Host': 'voz.vn'
        },
        uri: 'https://voz.vn/login/login',
        body: formData,
        method: 'POST'
    }, async function (error, res, body) {
        console.log(res.headers['set-cookie']);
        console.log(res.statusCode);
        form = null;
        if (res.statusCode != 200 & res.statusCode != 303) {
            callback('errorServer');
        } else if (res.headers['set-cookie'] == null) {
            callback('errorLogin');
        } else {
            callback(res.headers['set-cookie']);
        }
    });
}





