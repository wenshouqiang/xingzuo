const express = require('express');
// const AlipaySdk = require('alipay-sdk').default;
const { AlipaySdk } = require('alipay-sdk');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

const alipaySdk = new AlipaySdk({
    appId: process.env.ALIPAY_APP_ID,
    privateKey: process.env.ALIPAY_PRIVATE_KEY,
    alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
    gateway: process.env.ALIPAY_GATEWAY,
});

// 获取报告（含付费判断）
router.get('/:responseId', auth, async (req, res) => {
    const { responseId } = req.params;
    const userId = req.user.id;

    const [rows] = await db.query(
        'SELECT r.*, t.result_interpretation, t.price FROM user_responses r JOIN tests t ON r.test_id = t.id WHERE r.id = ? AND r.user_id = ?',
        [responseId, userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: '记录不存在' });
    const record = rows[0];
    const interpretation = record.result_interpretation;
    const price = record.price || 0;

    let report = '';
    if (record.mbti_type) {
        // MBTI 测试
        const mbtiData = interpretation[record.mbti_type];
        if (record.is_paid) {
            report = `【${mbtiData.title}】\n${mbtiData.description}\n\n贴合星座：${mbtiData.constellations}`;
        } else {
            report = `【${mbtiData.title}】\n${mbtiData.description}\n\n（完整解读需付费解锁）`;
        }
    } else {
        // 总分型测试（焦虑）
        const score = record.score;
        let fullReport = '';
        for (const range in interpretation) {
            const [min, max] = range.split('-').map(Number);
            if (score >= min && score <= max) {
                fullReport = record.is_paid ? interpretation[range].full : interpretation[range].free;
                break;
            }
        }
        report = fullReport;
    }

    res.json({ 
        score: record.score || 0, 
        report, 
        isPaid: record.is_paid,
        price: price,
        mbtiType: record.mbti_type || null
    });
});

// 创建支付宝支付链接
// router.post('/:responseId/create-payment', auth, async (req, res) => {
//     const { responseId } = req.params;
//     const userId = req.user.id;

//     // 验证记录是否属于当前用户
//     const [rows] = await db.query('SELECT test_id FROM user_responses WHERE id = ? AND user_id = ?', [responseId, userId]);
//     if (rows.length === 0) return res.status(404).json({ error: '记录不存在' });
//     const testId = rows[0].test_id;

//     // 获取价格（如果需要，也可在此返回价格给前端）
//     const [testRows] = await db.query('SELECT price FROM tests WHERE id = ?', [testId]);
//     const price = testRows[0]?.price || 0;

//     // 临时返回假支付链接（跳过支付宝）
//     const fakePaymentUrl = `${process.env.FRONTEND_URL}/report/${responseId}?success=true`;
//     res.json({ paymentUrl: fakePaymentUrl });
// });
router.post('/:responseId/create-payment', auth, async (req, res) => {
    const { responseId } = req.params;
    const userId = req.user.id;

    // 检查记录是否存在
    const [rows] = await db.query('SELECT test_id, user_id FROM user_responses WHERE id = ?', [responseId]);
    if (rows.length === 0) return res.status(404).json({ error: '记录不存在' });

    // 如果该记录还未关联用户，则绑定到当前用户
    if (rows[0].user_id === null) {
        await db.query('UPDATE user_responses SET user_id = ? WHERE id = ?', [userId, responseId]);
    } else if (rows[0].user_id !== userId) {
        return res.status(403).json({ error: '无权操作此记录' });
    }

   // 临时返回假支付链接（跳过支付宝）
const fakePaymentUrl = `${process.env.FRONTEND_URL}/report/${responseId}?success=true`;
res.json({ paymentUrl: fakePaymentUrl });
});

module.exports = router;