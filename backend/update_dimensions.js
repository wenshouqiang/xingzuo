const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

// 维度关键词映射（A 选项为维度对应项，B 选项为相反项）
// 注意：这里根据题目内容中的关键词来推断该题目测的是哪个维度
const keywordMap = {
  'E/I': {
    keywords: ['外向', '社交', '热闹', '聚会', '主动', '分享', '表达', '能量来自', '喜欢和人', '开朗', '合群', '主动认识', '带动氛围'],
    opposite: ['内向', '独处', '安静', '自己待', '被动', '倾听', '沉默', '独处充电', '喜欢独处', '内敛', '慢热']
  },
  'S/N': {
    keywords: ['现实', '具体', '实际', '事实', '细节', '务实', '眼前', '脚踏实地', '动手', '操作', '经验'],
    opposite: ['直觉', '想象', '抽象', '灵感', '整体', '未来', '可能性', '脑洞', '创意', '浪漫', '理想']
  },
  'T/F': {
    keywords: ['理性', '逻辑', '公平', '分析', '道理', '对错', '原则', '客观', '冷静', '规则', '解决问题'],
    opposite: ['感性', '感受', '人情', '共情', '体贴', '温柔', '和谐', '包容', '情绪', '关系']
  },
  'J/P': {
    keywords: ['计划', '规划', '条理', '有序', '规律', '安排', '提前', '按部就班', '完成', '有始有终', '目标'],
    opposite: ['随性', '灵活', '随意', '即兴', '自由', '临时', '随心情', '拖延', '随遇而安', '顺其自然']
  }
};

// 判断题目属于哪个维度
function detectDimension(questionText) {
  // 将题目文本（A选项和B选项合并）转为小写，便于匹配
  const text = questionText.toLowerCase();
  let bestDim = null;
  let maxScore = 0;

  for (const [dim, data] of Object.entries(keywordMap)) {
    let score = 0;
    // 检查关键词
    for (const kw of data.keywords) {
      if (text.includes(kw.toLowerCase())) score += 1;
    }
    // 检查相反关键词（如果出现相反关键词，可能属于另一维度，这里简单处理：若出现相反词，减分）
    for (const kw of data.opposite) {
      if (text.includes(kw.toLowerCase())) score -= 1;
    }
    if (score > maxScore) {
      maxScore = score;
      bestDim = dim;
    }
  }
  // 如果分数<=0，默认给一个维度（E/I），或者根据经验判断
  if (maxScore <= 0) {
    // 可额外根据题目中常见表述再判断，这里简单返回 E/I
    bestDim = 'E/I';
  }
  return bestDim;
}

(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // 获取所有未标注维度的题目（dimension IS NULL）
  const [questions] = await connection.query('SELECT id, content FROM questions WHERE dimension IS NULL');
  console.log(`找到 ${questions.length} 道需要标注维度的题目`);

  let updated = 0;
  for (const q of questions) {
    const dim = detectDimension(q.content);
    await connection.query('UPDATE questions SET dimension = ? WHERE id = ?', [dim, q.id]);
    updated++;
    if (updated % 100 === 0) console.log(`已处理 ${updated} 题`);
  }
  console.log(`更新完成，共更新 ${updated} 道题目`);

  await connection.end();
})();