const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// 获取所有测试
router.get('/', async (req, res) => {
    const [tests] = await db.query('SELECT id, title, description, price FROM tests');
    res.json(tests);
});

// 获取某个测试的题目
router.get('/:testId/questions', async (req, res) => {
    const { testId } = req.params;
    const [questions] = await db.query('SELECT id, content, options FROM questions WHERE test_id = ? ORDER BY id', [testId]);
    res.json(questions);
});

// 提交答案====登录才能答题
router.post('/:testId/submit', async (req, res) => {
    const { testId } = req.params;
    const { answers } = req.body;
    // 尝试获取用户ID（如果已登录则取 user.id，否则为 null）
    let userId = null;
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        }
    } catch (err) {
        console.error('Submit error:', err);
    return res.status(500).json({ error: '提交失败' });
    }

    // 获取测试的计分规则
    const [testRow] = await db.query('SELECT scoring_rules FROM tests WHERE id = ?', [testId]);
    if (!testRow.length) return res.status(404).json({ error: '测试不存在' });
    const scoringRules = testRow[0].scoring_rules;
    const ruleType = scoringRules?.type;

    if (ruleType !== 'MBTI') {
        return res.status(400).json({ error: '仅支持 MBTI 测试' });
    }

    // 获取所有题目及其维度
    const [questions] = await db.query(
        'SELECT dimension FROM questions WHERE test_id = ? ORDER BY id',
        [testId]
    );
    if (!questions.length) return res.status(404).json({ error: '没有题目数据' });

    // 初始化四个维度的计数
    let counts = { 'E/I': 0, 'S/N': 0, 'T/F': 0, 'J/P': 0 };
    let totalPerDim = { 'E/I': 0, 'S/N': 0, 'T/F': 0, 'J/P': 0 };

    questions.forEach((q, idx) => {
        const dim = q.dimension;
        if (!dim) return;
        totalPerDim[dim]++;
        if (answers[idx] === 0) { // 选 A
            counts[dim]++;
        }
    });

    // 计算 MBTI 类型
    let mbtiType = '';
    mbtiType += counts['E/I'] > totalPerDim['E/I'] / 2 ? 'E' : 'I';
    mbtiType += counts['S/N'] > totalPerDim['S/N'] / 2 ? 'S' : 'N';
    mbtiType += counts['T/F'] > totalPerDim['T/F'] / 2 ? 'T' : 'F';
    mbtiType += counts['J/P'] > totalPerDim['J/P'] / 2 ? 'J' : 'P';

    // 获取免费报告（标题+描述）
    const [testRow2] = await db.query('SELECT result_interpretation FROM tests WHERE id = ?', [testId]);
    const interpretation = testRow2[0].result_interpretation;
    const resultData = interpretation[mbtiType];
    const freeReport = resultData ? `${resultData.title}\n${resultData.description}` : '暂无解读';

    // 插入答题记录（user_id 可为 null）
    const [result] = await db.query(
        'INSERT INTO user_responses (user_id, test_id, answers, score, mbti_type) VALUES (?, ?, ?, ?, ?)',
        [userId, testId, JSON.stringify(answers), 0, mbtiType]
    );
    const responseId = result.insertId;

    res.json({ responseId, score: 0, freeReport, mbtiType });
});

module.exports = router;