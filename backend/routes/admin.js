const express = require('express');
const db = require('../db');
const router = express.Router();

// 简单的密码验证（请将密码修改为复杂的）
const ADMIN_PASSWORD = 'your_secret_password_123';  // 改成一个强密码

// 验证中间件
function checkAuth(req, res, next) {
    const pwd = req.headers['x-admin-password'] || req.query.password;
    if (pwd === ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: '未授权' });
    }
}

// 获取未解锁的记录列表（可按条件筛选）
router.get('/unlock-list', checkAuth, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT r.id, r.user_id, u.email, r.test_id, t.title as test_name, 
                   r.mbti_type, r.score, r.is_paid, r.created_at
            FROM user_responses r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN tests t ON r.test_id = t.id
            WHERE r.is_paid = 0
            ORDER BY r.id DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '查询失败' });
    }
});

// 获取所有用户及其未解锁的记录（分组）
router.get('/users-with-records', checkAuth, async (req, res) => {
    try {
        // 查询所有有答题记录的用户（包括未登录用户，user_id为null的单独处理）
        const [rows] = await db.query(`
            SELECT 
                u.id as user_id, 
                u.email,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'responseId', r.id,
                        'test_id', r.test_id,
                        'test_name', t.title,
                        'mbti_type', r.mbti_type,
                        'score', r.score,
                        'is_paid', r.is_paid,
                        'created_at', r.created_at
                    )
                ) as records
            FROM user_responses r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN tests t ON r.test_id = t.id
            GROUP BY u.id, u.email
            ORDER BY MAX(r.created_at) DESC
        `);
        // 处理 JSON 解析
        const result = rows.map(row => ({
            user_id: row.user_id,
            email: row.email || '未登录用户',
             records: row.records 
        }));
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '查询失败' });
    }
});

// 解锁指定记录
router.post('/unlock', checkAuth, async (req, res) => {
    const { responseId } = req.body;
    if (!responseId) {
        return res.status(400).json({ error: '缺少 responseId' });
    }
    try {
        await db.query('UPDATE user_responses SET is_paid = 1 WHERE id = ?', [responseId]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '解锁失败' });
    }
});

// 删除记录（仅允许删除已解锁的记录）
router.delete('/delete/:responseId', checkAuth, async (req, res) => {
    const { responseId } = req.params;
    try {
        // 先检查记录是否存在且已解锁
        const [rows] = await db.query('SELECT is_paid FROM user_responses WHERE id = ?', [responseId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: '记录不存在' });
        }
        if (rows[0].is_paid !== 1) {
            return res.status(403).json({ error: '只能删除已解锁的记录' });
        }
        await db.query('DELETE FROM user_responses WHERE id = ?', [responseId]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '删除失败' });
    }
});
module.exports = router;