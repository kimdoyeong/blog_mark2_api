const JWT = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

const error_template = require('../../common/error_template');

const codeSchema = require('../../models/code');
const userSchema = require('../../models/user');

const jwt_secret = process.env.JWT_SECRET || "Adgdsg#ddgdg45ty4wefwefwe9jfpgpnweg3DWGwdgtg42weGWEDgv24g";

// /user/auth/code/:code, 코드 검증 부분. 
// 현재는 임시로 모두 true 반환
router.get('/code/:code', (req, res) => {
    res.json({
        success: true
    });
});

// /user/auth, JWT 토큰 발급 부분.
router.post('/', (req, res) => {
    const {username, password} = req.body;
    
    if (!username || !password) {
        res.status(400).json(error_template(400, "아이디나 비밀번호 필드가 비어 있습니다."));
        return;
    }

    const host = process.env.HOST || req.hostname;
    userSchema.findOne({
        username: username
    })
    .then((value) => {
        if (value === null || !value.comparePassword(password)) {
            res.status(202).json(error_template(202, "아이디가 없거나 비밀번호가 다릅니다."));
            return;
        }
        const accessToken = JWT.sign(
            {
                _id: value._id,
                username: value.username,
                nickname: value.nickname
            },
            jwt_secret,
            {
                expiresIn: '1d',
                issuer: host,
                subject: 'userAuth'
            }
        );
        res.status(200).json({
            success: true,
            accessToken
        });
    });
    
})

// /user/auth/validate, JWT 검증
router.get('/validate', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).json(error_template(403, "토큰이 필요합니다."));
    }
    try {
        let verify = JWT.verify(token, jwt_secret);
        res.status(200).json({success: true, decoded: verify});
    } catch (e) {
        return res.status(403).json(error_template(403, "토큰이 유효하지 않습니다."));
    }
})
module.exports = router;