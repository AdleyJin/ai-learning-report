import type { ReportTemplate, ChatMessage, AgentStep, ExecutionSummary } from '../types';

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'weekly',
    name: '本周学情报告',
    description: '按周统计班级整体学情数据',
    defaultPrompt: '帮我生成本周班级学情报告，补充班级、周期等信息，例如：三年级 A 班 6 月第 2 周。',
    subTemplates: [
      {
        id: 'weekly-score',
        name: '成绩分布',
        description: '各分数段人数与占比',
        prompt: '请生成本周三年级 A 班的成绩分布分析，包含各分数段人数、占比及与上周的对比趋势。',
      },
      {
        id: 'weekly-homework',
        name: '作业完成情况',
        description: '提交率与质量统计',
        prompt: '请统计本周三年级 A 班的作业完成情况，包含提交率、按时率、订正率以及未完成名单。',
      },
      {
        id: 'weekly-class',
        name: '课堂表现',
        description: '参与度与互动情况',
        prompt: '请分析本周三年级 A 班的课堂表现，包含发言次数、互动参与度和需要关注的学生。',
      },
      {
        id: 'weekly-knowledge',
        name: '知识点掌握',
        description: '本周重点知识点',
        prompt: '请总结本周三年级 A 班各知识点的掌握情况，标出掌握薄弱的知识点并给出训练建议。',
      },
    ],
  },
  {
    id: 'monthly',
    name: '月度学情报告',
    description: '按月综合分析学习趋势',
    defaultPrompt: '帮我生成月度学情报告，补充班级、月份等信息，例如：三年级 A 班 6 月。',
    subTemplates: [
      {
        id: 'monthly-trend',
        name: '学习趋势',
        description: '月内成绩走势',
        prompt: '请生成三年级 A 班本月的学习趋势分析，按周展示平均分与作业完成率的走势变化。',
      },
      {
        id: 'monthly-compare',
        name: '月度对比',
        description: '与上月数据对比',
        prompt: '请对比三年级 A 班本月与上月的关键学情指标，列出提升与下降的项目及原因分析。',
      },
      {
        id: 'monthly-radar',
        name: '能力雷达',
        description: '多维能力画像',
        prompt: '请生成三年级 A 班本月的多维能力雷达分析，覆盖计算、应用、理解、表达等维度。',
      },
      {
        id: 'monthly-goal',
        name: '目标达成',
        description: '月度目标完成度',
        prompt: '请统计三年级 A 班本月教学目标的达成情况，列出已达成、待跟进的目标项。',
      },
    ],
  },
  {
    id: 'knowledge',
    name: '知识点掌握报告',
    description: '分析各知识点掌握程度',
    defaultPrompt: '帮我生成知识点掌握报告，补充班级、知识点范围等信息。',
    subTemplates: [
      {
        id: 'knowledge-score',
        name: '分数分布',
        description: '知识点得分分布',
        prompt: '请生成三年级 A 班各知识点的分数分布分析，标出平均得分率最低的知识点。',
      },
      {
        id: 'knowledge-grade',
        name: '成绩分布',
        description: '掌握等级分布',
        prompt: '请按掌握等级（优秀/良好/待提升）统计三年级 A 班各知识点的人数分布。',
      },
      {
        id: 'knowledge-wrong',
        name: '错题分析',
        description: '高频错题归因',
        prompt: '请分析三年级 A 班的高频错题，归纳错误类型并定位对应的薄弱知识点。',
      },
      {
        id: 'knowledge-weak',
        name: '薄弱知识点',
        description: '待强化知识点清单',
        prompt: '请列出三年级 A 班当前最需强化的薄弱知识点清单，并给出针对性的训练建议。',
      },
    ],
  },
  {
    id: 'student',
    name: '个人学情报告',
    description: '单个学生的学习详情',
    defaultPrompt: '帮我生成个人学情报告，补充学生姓名、周期等信息，例如：小明 本月。',
    subTemplates: [
      {
        id: 'student-trend',
        name: '成绩走势',
        description: '个人成绩变化',
        prompt: '请生成该学生近期的成绩走势分析，展示各次测验的得分变化与排名变化。',
      },
      {
        id: 'student-strength',
        name: '强弱项分析',
        description: '优势与短板',
        prompt: '请分析该学生的强项与薄弱项，按知识点维度给出掌握情况和提升优先级。',
      },
      {
        id: 'student-homework',
        name: '作业明细',
        description: '作业完成记录',
        prompt: '请汇总该学生近期的作业完成明细，包含提交、订正及典型错题。',
      },
      {
        id: 'student-advice',
        name: '学习建议',
        description: '个性化提升建议',
        prompt: '请基于该学生的学情数据，给出个性化的学习提升建议和阶段性目标。',
      },
    ],
  },
];

export const MOCK_SUBJECTS = [
  '三年级 A 班',
  '三年级 B 班',
  '四年级 A 班',
  '四年级 B 班',
  '五年级 A 班',
];

const MOCK_COMPLETED_STEPS: AgentStep[] = [
  { id: 'parse',   type: 'search', label: '解析 query 并识别可视化报告需求',                detail: '理解你的诉求 · 确定报告类型',    status: 'done' },
  { id: 'plan',    type: 'plan',   label: '自主规划报告所需内容',                           detail: '拆解指标 · 设计报告结构',        status: 'done' },
  { id: 'execute', type: 'tools',  label: '调用相关工具进行数据获取、指标计算、前端渲染等', detail: '获取数据 · 计算指标 · 渲染报告', status: 'done' },
  { id: 'return',  type: 'report', label: '返回报告',                                       detail: '学情报告已生成',                 status: 'done' },
];

const MOCK_EXECUTION_SUMMARY: ExecutionSummary = {
  commandsRun: 2,
  filesRead: 1,
  filesCreated: 1,
};

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'agent',
    content: '你好！我是 AI 学情助手，可以帮你生成班级或个人的学情分析报告。请选择报告模版，填写分析内容后提交。',
    timestamp: '10:00',
  },
  {
    id: '2',
    role: 'user',
    content: '帮我生成三年级 A 班 5 月的月度学情报告。',
    timestamp: '09:10',
  },
  {
    id: '3',
    role: 'agent',
    content: '好的，正在为你生成三年级 A 班 5 月月度学情报告，请稍候……',
    timestamp: '09:10',
    agentSteps: MOCK_COMPLETED_STEPS,
    executionSummary: MOCK_EXECUTION_SUMMARY,
    reportSummary: '5 月整体趋势向好，月均分 84.1 分，较 4 月提升 3.5 分。作业完成率维持在 91%，高频错题主要集中在小数乘法模块。',
    report: {
      id: 'r0',
      title: '5 月月度学情报告',
      status: 'completed',
      generatedAt: '2026-06-16 09:11',
      formats: ['pdf'],
      stats: [
        { label: '月均分', value: '84.1', unit: '分', trend: 'up', trendValue: '+3.5', tooltip: '与 4 月相比' },
        { label: '作业完成率', value: '91', unit: '%', trend: 'neutral', trendValue: '持平', tooltip: '与 4 月相比' },
        { label: '优秀人数', value: '10', unit: '人', trend: 'up', trendValue: '+2', tooltip: '≥ 90 分视为优秀' },
      ],
      analysisText: `5 月三年级 A 班整体趋势向好，月均分 84.1 分，较 4 月提升 3.5 分。\n\n**知识点掌握**：小数乘法模块掌握一般，整体正确率 79%，高频错题集中在小数点定位；整数四则运算稳步提升，正确率达 95%。\n\n**作业情况**：月均作业完成率 91%，维持稳定，偶发性缺交多出现在周五。\n\n**建议**：5 月下旬可针对小数乘法安排 1~2 次专项练习，重点强化小数点定位的方法规律。`,
    },
  },
  {
    id: '4',
    role: 'user',
    content: '帮我生成三年级 A 班知识点掌握报告，重点看分数运算。',
    timestamp: '09:45',
  },
  {
    id: '5',
    role: 'agent',
    content: '好的，正在为你生成三年级 A 班知识点掌握报告，请稍候……',
    timestamp: '09:45',
    agentSteps: MOCK_COMPLETED_STEPS,
    executionSummary: { commandsRun: 3, filesRead: 2, filesCreated: 1 },
    reportSummary: '分数运算模块整体掌握较好，正确率 88%；混合运算和约分环节存在薄弱点，建议针对性强化。',
    report: {
      id: 'r00',
      title: '知识点掌握报告',
      status: 'completed',
      generatedAt: '2026-06-16 09:46',
      formats: ['pdf'],
      stats: [
        { label: '分数运算正确率', value: '88', unit: '%', trend: 'up', trendValue: '+5%', tooltip: '与上月相比' },
        { label: '混合运算正确率', value: '74', unit: '%', trend: 'down', trendValue: '-2%', tooltip: '与上月相比' },
        { label: '待强化人数', value: '8', unit: '人', trend: 'neutral', trendValue: '待跟进', tooltip: '低于 70 分视为待强化' },
      ],
      analysisText: `三年级 A 班分数运算模块整体掌握较好，正确率达 88%，较上月提升 5 个百分点。\n\n**薄弱环节**：混合运算（含约分）正确率仅 74%，主要错因在于约分步骤遗漏或错位；8 名同学在该环节表现明显偏弱。\n\n**建议**：下周可安排 1 次分数混合运算专项课，重点演示约分流程；对 8 名薄弱同学可提供额外练习册。`,
    },
  },
  {
    id: '6',
    role: 'user',
    content: '帮我生成三年级 A 班本周的学情报告。',
    timestamp: '10:02',
  },
  {
    id: '7',
    role: 'agent',
    content: '好的，正在为你生成三年级 A 班本周学情报告，请稍候……',
    timestamp: '10:02',
    agentSteps: MOCK_COMPLETED_STEPS,
    executionSummary: MOCK_EXECUTION_SUMMARY,
    reportSummary: '本周三年级 A 班整体表现良好，班级平均分 87.3 分，较上周提升 2.1 分。作业完成率达 94%，优秀人数持平。\n\n分数运算模块掌握较扎实，正确率达 91%；应用题理解能力有所提升，但仍有 6 名同学出现理解偏差，建议加强专项练习。重点关注成绩偏低的 3 名同学，可安排课后辅导。',
    report: {
      id: 'r1',
      title: '本周学情报告',
      status: 'completed',
      generatedAt: '2026-06-17 10:03',
      formats: ['pdf'],
      stats: [
        { label: '班级平均分', value: '87.3', unit: '分', trend: 'up', trendValue: '+2.1', tooltip: '与上周相比' },
        { label: '作业完成率', value: '94', unit: '%', trend: 'up', trendValue: '+3%', tooltip: '与上周相比' },
        { label: '优秀人数', value: '12', unit: '人', trend: 'neutral', trendValue: '持平', tooltip: '≥ 90 分视为优秀' },
      ],
      analysisText: `本周三年级 A 班整体表现良好，班级平均分 87.3 分，较上周提升 2.1 分。

**知识点掌握**：分数运算模块掌握较扎实，整体正确率达 91%；文字题理解能力有所提升，但仍有 6 名同学在应用题环节出现理解偏差，建议加强专项训练。

**作业情况**：本周作业完成率 94%，较上周提升 3 个百分点，未完成同学主要集中在每周四的延伸练习部分，建议跟进。

**建议**：重点关注成绩偏低的 3 名同学（小明、小华、小刚），可安排课后辅导；对进步明显的同学给予及时鼓励。`,
    },
  },
];
