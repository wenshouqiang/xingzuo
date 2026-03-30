const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

// 定义三个测试的配置（文件路径、名称、题目字段名、选项字段名）
const tests = [
      {
    file: '星座版MBTI测试（5题）.json',
    testName: '星系星座版MBTI性格测试（5题）',
    questionsKey: 'questions',
    optionAKey: 'A',
    optionBKey: 'B',
    resultsKey: 'results', // 有完整解读
  }
//   {
//     file: '星座版MBTI测试（99题）.json',
//     testName: '星系星座版MBTI性格测试（99题）',
//     questionsKey: 'questions',
//     optionAKey: 'A',
//     optionBKey: 'B',
//     resultsKey: 'results', // 有完整解读
//   },
//   {
//     file: '星系星座版 MBTI 性格测试 146 题.json',
//     testName: '星系星座版MBTI性格测试（146题）',
//     questionsKey: 'questions',
//     optionAKey: 'option_a',
//     optionBKey: 'option_b',
//     resultsKey: null, // 没有解读，将使用默认解读（从99题复制）
//   },
//   {
//     file: '星系星座版 MBTI 性格测试 200题.json',
//     testName: '星系星座版MBTI性格测试（200题）',
//     questionsKey: 'test_questions',
//     optionAKey: 'option_a',
//     optionBKey: 'option_b',
//     resultsKey: null,
//   },
];

// 默认的16种MBTI解读（从99题版本中提取）
const defaultResults = {
  "INFP": {"title":"星空软绵星云，慢热浪漫的共情者", "constellations":"巨蟹、双鱼、天蝎（水象核心），带少许水瓶直觉脑洞", "description":"内心丰富细腻，偏爱精神共鸣，随遇而安且共情力拉满，核心是「内观走心，自在随心」。"},
  "INFJ": {"title":"星空引路星，温柔坚定的守护者", "constellations":"天蝎、巨蟹、摩羯（水象+土象结合）", "description":"内心细腻且有主见，共情力强又懂得规划，是温柔与坚定的结合体，核心是「走心利他，谋定后动」。"},
  "INTP": {"title":"星空探索星，脑洞大开的逻辑家", "constellations":"水瓶、天蝎、双子（风向+水象结合）", "description":"内心有丰富的脑洞和逻辑体系，偏爱独处思考，随性且不喜束缚，核心是「理性脑洞，自在探索」。"},
  "INTJ": {"title":"星空北极星，冷静睿智的谋略家", "constellations":"摩羯、水瓶、天蝎（土象+风向+水象）", "description":"冷静理智、有远见有规划，内心独立且有强大的逻辑体系，核心是「理性谋远，坚定执行」。"},
  "ISFP": {"title":"星空微光星，温柔务实的体验者", "constellations":"金牛、巨蟹、双鱼（土象+水象）", "description":"内心温柔务实，偏爱当下的真实体验，随遇而安且不喜张扬，核心是「务实走心，享受当下」。"},
  "ISFJ": {"title":"星空暖星，踏实靠谱的暖心人", "constellations":"处女、巨蟹、金牛（土象+水象核心）", "description":"温柔务实、细心靠谱，有规划且重人情，是身边人的“贴心小管家”，核心是「务实暖心，稳扎稳打」。"},
  "ISTP": {"title":"星空实干星，冷静务实的行动者", "constellations":"摩羯、金牛、天蝎（土象+水象）", "description":"冷静务实、动手能力强，偏爱随性的生活，不喜欢繁琐的规矩和计划，核心是「务实理性，随性行动」。"},
  "ISTJ": {"title":"星空定星，沉稳严谨的实干家", "constellations":"摩羯、处女、金牛（土象核心）", "description":"沉稳务实、理性严谨，有极强的规划性和责任心，是靠谱的“定海神针”，核心是「务实理性，稳字当头」。"},
  "ENFP": {"title":"星空流星，热情浪漫的追梦人", "constellations":"白羊、天秤、双鱼（火象+风向+水象）", "description":"热情开朗、脑洞大开，共情力强且随性自在，是身边的“快乐小太阳”，核心是「浪漫热情，自在追梦」。"},
  "ENFJ": {"title":"星空暖阳星，热情坚定的领导者", "constellations":"狮子、天秤、巨蟹（火象+风向+水象）", "description":"热情开朗、共情力强，有远见有规划且善于带动他人，是身边的“暖心领导者”，核心是「热情利他，领航前行」。"},
  "ENTP": {"title":"星空智趣星，机智开朗的辩论家", "constellations":"双子、水瓶、白羊（风向+火象）", "description":"机智开朗、逻辑思维强，脑洞大开且随性自在，喜欢辩论和探索新鲜事物，核心是「理性脑洞，乐在探索」。"},
  "ENTJ": {"title":"星空曜星，果断睿智的领导者", "constellations":"狮子、水瓶、摩羯（火象+风向+土象）", "description":"开朗果断、理性睿智，有远见有规划且善于领导，是天生的“领导者”，核心是「理性谋远，果断领航」。"},
  "ESFP": {"title":"星空繁星，热情务实的快乐家", "constellations":"白羊、天秤、金牛（火象+风向+土象）", "description":"热情开朗、务实暖心，偏爱当下的真实体验，随性自在且善于社交，核心是「务实热情，享受生活」。"},
  "ESFJ": {"title":"星空暖阳星，热情务实的暖心组织者", "constellations":"天秤、巨蟹、处女（风向+水象+土象）", "description":"热情开朗、务实暖心，有规划且善于组织，是身边的“暖心组织者”，核心是「务实热情，用心张罗」。"},
  "ESTP": {"title":"星空行动星，热情务实的行动家", "constellations":"白羊、金牛、天秤（火象+土象+风向）", "description":"热情开朗、务实理性，动手能力强且随性自在，喜欢行动和探索，核心是「务实理性，敢做敢闯」。"},
  "ESTJ": {"title":"星空掌舵星，热情严谨的实干领导者", "constellations":"狮子、摩羯、处女（火象+土象核心）", "description":"热情开朗、务实理性，严谨有规划且善于领导，是靠谱的“实干领导者”，核心是「务实理性，果断执行」。"}
};

// 去除 BOM 并解析 JSON
function readJsonFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return JSON.parse(content);
}

(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // 获取当前最大 test_id，新测试从最大+1开始
  const [rows] = await connection.query('SELECT MAX(id) as maxId FROM tests');
  let nextId = (rows[0].maxId || 0) + 1;

  for (const testConfig of tests) {
    try {
      console.log(`\n正在处理: ${testConfig.file}`);
      const data = readJsonFile(testConfig.file);
      
      // 提取测试信息
      const title = testConfig.testName;
      const description = data.test_instruction || data.instruction || '';
      const scoringRules = JSON.stringify({ type: 'MBTI', dimensions: ['E/I','S/N','T/F','J/P'] });
      
      // 结果解读：优先使用文件中的 results，否则使用默认
      let results;
      if (testConfig.resultsKey && data[testConfig.resultsKey]) {
        results = data[testConfig.resultsKey];
        // 转换为 key-value 对象（99题的 results 已是对象格式，可以直接用）
        if (Array.isArray(results)) {
          // 如果是数组，转换为对象
          const obj = {};
          results.forEach(item => {
            obj[item.type] = {
              title: item.title,
              description: item.description,
              constellations: item.constellations
            };
          });
          results = obj;
        }
      } else {
        results = defaultResults;
      }
      const resultInterpretation = JSON.stringify(results);
      const price = 500; // 默认5元，可以后续修改

      // 插入 tests
      await connection.query(
        'INSERT INTO tests (id, title, description, scoring_rules, result_interpretation, price) VALUES (?, ?, ?, ?, ?, ?)',
        [nextId, title, description, scoringRules, resultInterpretation, price]
      );
      console.log(`  -> 测试插入成功，ID = ${nextId}`);

      // 获取题目列表
      let questions = data[testConfig.questionsKey];
      if (!questions) {
        console.error(`  错误: 找不到 ${testConfig.questionsKey} 字段`);
        continue;
      }

      // 清空该测试的旧题目（如果有）
      await connection.query('DELETE FROM questions WHERE test_id = ?', [nextId]);

      // 插入题目
      let count = 0;
      for (const q of questions) {
        // 提取题目序号（不同文件可能用 q_no 或 id）
        const qNo = q.q_no || q.id;
        const content = `第${qNo}题：${q[testConfig.optionAKey]} / ${q[testConfig.optionBKey]}`;
        const options = JSON.stringify([q[testConfig.optionAKey], q[testConfig.optionBKey]]);
        const scores = JSON.stringify([1, 0]); // A得1分，B得0分
        await connection.query(
          'INSERT INTO questions (test_id, content, options, scores) VALUES (?, ?, ?, ?)',
          [nextId, content, options, scores]
        );
        count++;
      }
      console.log(`  -> 插入题目 ${count} 道`);

      nextId++;
    } catch (err) {
      console.error(`处理 ${testConfig.file} 时出错:`, err.message);
    }
  }

  console.log('\n所有测试导入完成！');
  await connection.end();
})();