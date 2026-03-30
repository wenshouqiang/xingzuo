const express = require('express');
// const AlipaySdk = require('alipay-sdk').default;
const { AlipaySdk } = require('alipay-sdk');
// const AlipaySdk = require('alipay-sdk');

const db = require('../db');
const router = express.Router();

const alipaySdk = new AlipaySdk({
    appId: process.env.ALIPAY_APP_ID,
    privateKey: process.env.ALIPAY_PRIVATE_KEY,
    alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
    gateway: process.env.ALIPAY_GATEWAY,
});

router.post('/notify', async (req, res) => {
    const params = req.body;
    // 验证签名
    const isValid = await alipaySdk.checkNotifySign(params);
    if (!isValid) {
        return res.send('failure');
    }
    const { out_trade_no, trade_status } = params;
    if (trade_status === 'TRADE_SUCCESS') {
        // 从 out_trade_no 中提取 responseId
        const parts = out_trade_no.split('_');
        const responseId = parts[parts.length - 1];
        await db.query('UPDATE user_responses SET is_paid = 1 WHERE id = ?', [responseId]);
        res.send('success');
    } else {
        res.send('failure');
    }
});

module.exports = router;