import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Button, Tabs } from '@heroui/react';
import { FileText } from '@gravity-ui/icons';
import { ChatStream } from './components/layout/ChatStream';
import { InputBar } from './components/layout/InputBar';
import { ErrorAlert } from './components/states/ErrorAlert';
import { ReportPanel } from './components/report/ReportPanel';
import { ReportCenterPanel } from './components/report/ReportCenterPanel';
import type { ChatMessage, Report, InputFormValues, AgentStep } from './types';
import { MOCK_MESSAGES, REPORT_TEMPLATES } from './data/mock';

/** 侧栏显示模式：null = 收起；center = 报告中心列表；detail = 报告详情 */
type SidebarMode = 'center' | 'detail' | null;

type AppView = 'default' | 'loading' | 'empty' | 'error';

const VIEWS: { key: AppView; label: string }[] = [
  { key: 'default', label: '默认态' },
  { key: 'loading', label: '加载态' },
  { key: 'empty', label: '空状态' },
  { key: 'error', label: '错误态' },
];

// Agent 执行阶段定义（按 PRD 流程：阶段二开始工作 → 阶段三逐步执行）
const AGENT_STEPS: AgentStep[] = [
  { id: 'parse',   type: 'search', label: '解析 query 并识别可视化报告需求',                 detail: '理解你的诉求 · 确定报告类型',     status: 'pending' },
  { id: 'plan',    type: 'plan',   label: '自主规划报告所需内容',                            detail: '拆解指标 · 设计报告结构',         status: 'pending' },
  { id: 'execute', type: 'tools',  label: '调用相关工具进行数据获取、指标计算、前端渲染等',  detail: '获取数据 · 计算指标 · 渲染报告',  status: 'pending' },
  { id: 'return',  type: 'report', label: '返回报告',                                        detail: '学情报告已生成',                  status: 'pending' },
];

// 每个步骤的耗时（毫秒）—— 模拟真实工具调用的不同时长
// 解析需求(快) → 规划内容(中) → 调用工具执行(最慢，数据+计算+渲染) → 返回报告(快)
const STEP_DURATIONS = [1200, 2000, 4500, 1200];

function useMessages(
  initialMessages: ChatMessage[],
  onReportReady?: (report: Report) => void,
) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const updateAgentMsg = (
    agentMsgId: string,
    updater: (msg: ChatMessage) => ChatMessage,
    setter: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ) => {
    setter((prev) => prev.map((m) => (m.id === agentMsgId ? updater(m) : m)));
  };

  const addLoadingReport = (
    values: InputFormValues,
    setter: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    onComplete?: () => void,
  ): ReturnType<typeof setTimeout>[] => {
    const template = REPORT_TEMPLATES.find((t) => t.id === values.templateId);
    const id = String(Date.now());
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const agentMsgId = `agent-${id}`;

    const userMsg: ChatMessage = {
      id: `user-${id}`,
      role: 'user',
      content: values.prompt,
      timestamp: timeStr,
    };

    // 初始 Agent 消息：isThinking 状态，无步骤无报告
    const agentMsg: ChatMessage = {
      id: agentMsgId,
      role: 'agent',
      content: `好的，正在为你生成${template?.name ?? '学情报告'}，请稍候……`,
      timestamp: timeStr,
      isThinking: true,
    };

    setter((prev) => [...prev, userMsg, agentMsg]);

    const THINKING_DELAY = 700;   // 阶段一：星形 loading
    // 阶段二：文案逐字打出，字符数 * 38ms + 余量
    const contentLen = agentMsg.content.length;
    const TYPING_DELAY = contentLen * 38 + 300;

    const timerIds: ReturnType<typeof setTimeout>[] = [];

    // 阶段二：thinking 结束 → 文案逐字出现（animateContent=true，无步骤）
    timerIds.push(setTimeout(() => {
      updateAgentMsg(
        agentMsgId,
        (msg) => ({ ...msg, isThinking: false, animateContent: true }),
        setter
      );
    }, THINKING_DELAY));

    // 阶段三：打字完成 → Working... + 第一步出现
    timerIds.push(setTimeout(() => {
      updateAgentMsg(
        agentMsgId,
        (msg) => ({
          ...msg,
          agentSteps: [{ ...AGENT_STEPS[0], status: 'active' }],
          report: {
            id,
            title: template?.name ?? '学情报告',
            status: 'loading',
            formats: ['pdf'],
          },
        }),
        setter
      );
    }, THINKING_DELAY + TYPING_DELAY));

    // 逐步推进：当前步 done → 下一步 active 追加到数组末尾
    let elapsed = THINKING_DELAY + TYPING_DELAY;
    AGENT_STEPS.forEach((_, stepIndex) => {
      elapsed += STEP_DURATIONS[stepIndex];
      timerIds.push(setTimeout(() => {
        updateAgentMsg(
          agentMsgId,
          (msg) => {
            const prev = msg.agentSteps ?? [];
            const updated = prev.map((s, i) =>
              i === stepIndex ? { ...s, status: 'done' as const } : s
            );
            const next = AGENT_STEPS[stepIndex + 1];
            const steps = next
              ? [...updated, { ...next, status: 'active' as const }]
              : updated;
            return { ...msg, agentSteps: steps };
          },
          setter
        );
      }, elapsed));
    });

    // 全部完成后：写入 executionSummary + 完成报告 + 自动打开右侧面板
    const totalDuration = THINKING_DELAY + TYPING_DELAY + STEP_DURATIONS.reduce((a, b) => a + b, 0) + 400;
    timerIds.push(setTimeout(() => {
      const completedSteps: AgentStep[] = AGENT_STEPS.map((s) => ({ ...s, status: 'done' }));
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${timeStr}`;
      const completedReport: Report = {
        id,
        title: template?.name ?? '学情报告',
        status: 'completed',
        generatedAt: dateStr,
        formats: ['pdf'],
        stats: [
          { label: '班级平均分', value: '87.3', unit: '分', trend: 'up', trendValue: '+2.1', tooltip: '与上周相比' },
          { label: '作业完成率', value: '94', unit: '%', trend: 'up', trendValue: '+3%', tooltip: '与上周相比' },
          { label: '优秀人数', value: '12', unit: '人', trend: 'neutral', trendValue: '持平', tooltip: '≥ 90 分视为优秀' },
        ],
        analysisText: `本周整体表现良好，班级平均分 87.3 分，较上周提升 2.1 分。\n\n**知识点掌握**：分数运算模块掌握较扎实，整体正确率达 91%；文字题理解能力有所提升，但仍有 6 名同学在应用题环节出现理解偏差，建议加强专项训练。\n\n**作业情况**：本周作业完成率 94%，较上周提升 3 个百分点。\n\n**建议**：重点关注成绩偏低的 3 名同学，可安排课后辅导。`,
      };

      updateAgentMsg(
        agentMsgId,
        (msg) => ({
          ...msg,
          agentSteps: completedSteps,
          executionSummary: { commandsRun: 2, filesRead: 1, filesCreated: 1 },
          reportSummary: `本周班级整体表现良好，班级平均分 87.3 分，较上周提升 2.1 分。作业完成率达 94%，优秀人数持平。\n\n分数运算模块掌握较扎实，正确率达 91%；应用题理解能力有所提升，但仍有 6 名同学出现理解偏差，建议加强专项练习。重点关注成绩偏低的 3 名同学，可安排课后辅导。`,
          report: completedReport,
        }),
        setter
      );

      // 阶段四：右侧面板自动展开
      onReportReady?.(completedReport);
      onComplete?.();
    }, totalDuration));

    return timerIds;
  };

  const retryReport = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId || !msg.report) return msg;
        return {
          ...msg,
          report: { ...msg.report, status: 'loading', errorMessage: undefined },
        };
      })
    );
  };

  return {
    messages,
    setMessages,
    addLoadingReport: (values: InputFormValues, onComplete?: () => void) =>
      addLoadingReport(values, setMessages, onComplete),
    retryReport,
  };
}


export default function App() {
  const [view, setView] = useState<AppView>('default');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);

  // 侧栏模式：null 收起 | 'center' 报告中心列表 | 'detail' 报告详情
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(null);
  // 是否由报告中心进入详情（控制是否显示返回按钮）
  const [fromCenter, setFromCenter] = useState(false);
  // 当前在详情侧栏中显示的报告
  const [panelReport, setPanelReport] = useState<Report | null>(null);

  const { messages, setMessages, addLoadingReport, retryReport } = useMessages(
    MOCK_MESSAGES,
    (report) => {
      // 阶段四：自动展开右侧详情面板
      setPanelReport(report);
      setSidebarMode('detail');
      setFromCenter(false);
    },
  );

  // 所有报告（从消息流中提取），按时间倒序（最新在前）
  const allReports = useMemo<Report[]>(() => {
    const reports: Report[] = [];
    for (const m of messages) {
      if (m.report) reports.push(m.report);
    }
    return reports.reverse();
  }, [messages]);

  const handleViewChange = (v: AppView) => {
    setView(v);
    setShowError(false);

    if (v === 'empty') {
      setMessages([]);
    } else if (v === 'loading') {
      setMessages([
        {
          id: 'a1',
          role: 'agent',
          content: '好的，正在为你生成学情报告，请稍候……',
          timestamp: '10:00',
          agentSteps: AGENT_STEPS.slice(0, 3).map((s, i) => ({
            ...s,
            status: i < 2 ? ('done' as const) : ('active' as const),
          })),
          report: {
            id: 'loading-demo',
            title: '本周学情报告',
            status: 'loading',
            formats: ['pdf'],
          },
        },
      ]);
    } else if (v === 'error') {
      setMessages([
        {
          id: 'a1',
          role: 'agent',
          content: '生成学情报告时遇到问题，请重试。',
          timestamp: '10:00',
          report: {
            id: 'error-demo',
            title: '本周学情报告',
            status: 'error',
            formats: ['pdf'],
            errorMessage: 'Agent 生成过程中遇到错误，请重试或联系管理员。',
          },
        },
      ]);
      setShowError(true);
    } else {
      setMessages(MOCK_MESSAGES);
    }
  };

  const pendingTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const handleSubmit = (values: InputFormValues) => {
    setIsSubmitting(true);
    const ids = addLoadingReport(values, () => setIsSubmitting(false));
    pendingTimers.current = ids;
  };

  const handleStop = useCallback(() => {
    pendingTimers.current.forEach(clearTimeout);
    pendingTimers.current = [];
    setIsSubmitting(false);
    setMessages((prev) => prev.map((msg) => {
      if (msg.role !== 'agent' || !msg.agentSteps) return msg;
      const hasActive = msg.agentSteps.some((s) => s.status === 'active' || s.status === 'pending');
      if (!hasActive) return msg;
      return {
        ...msg,
        isThinking: false,
        agentSteps: msg.agentSteps.map((s) =>
          s.status === 'active' || s.status === 'pending'
            ? { ...s, status: 'done' as const }
            : s
        ),
        report: msg.report?.status === 'loading'
          ? { ...msg.report, status: 'error' as const, errorMessage: '已取消生成' }
          : msg.report,
      };
    }));
  }, [setMessages]);

  const handleDownload = (_report: Report) => {
    alert('开始下载报告（演示）');
  };

  const handleRetry = (_messageId: string) => {
    retryReport(_messageId);
    setShowError(false);
  };

  // ── 侧栏控制 ──

  /** 从对话流报告卡片点击「查看」 */
  const handleViewFromChat = (report: Report) => {
    if (panelReport?.id === report.id && sidebarMode === 'detail' && !fromCenter) {
      // 再次点击同一份报告 → 收起
      setSidebarMode(null);
      setPanelReport(null);
    } else {
      setPanelReport(report);
      setSidebarMode('detail');
      setFromCenter(false);
    }
  };

  /** 从报告中心列表点击某份报告 */
  const handleViewFromCenter = (report: Report) => {
    setPanelReport(report);
    setSidebarMode('detail');
    setFromCenter(true);
  };

  /** 详情态「返回列表」 */
  const handleBackToCenter = () => {
    setSidebarMode('center');
    setPanelReport(null);
    setFromCenter(false);
  };

  /** 关闭整个侧栏 */
  const handleClosePanel = () => {
    setSidebarMode(null);
    setPanelReport(null);
    setFromCenter(false);
  };

  /** 切换报告中心（顶部栏入口） */
  const toggleReportCenter = () => {
    if (sidebarMode === 'center') {
      setSidebarMode(null);
    } else {
      setSidebarMode('center');
      setFromCenter(false);
    }
  };

  const panelOpen = sidebarMode !== null;

  // 关闭动画期间保留最后渲染的内容，避免内容突然消失
  const [displayedReport, setDisplayedReport] = useState<Report | null>(null);
  const [displayedSidebarMode, setDisplayedSidebarMode] = useState<'center' | 'detail' | null>(null);

  if (panelReport && panelReport !== displayedReport) {
    setDisplayedReport(panelReport);
  }
  if (sidebarMode && sidebarMode !== displayedSidebarMode) {
    setDisplayedSidebarMode(sidebarMode);
  }

  // 移动端检测
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // 可拖拽分割线（百分比，20% ~ 80%）—— 桌面端
  // 报告中心与报告详情使用各自独立的宽度，互不影响
  const [centerPct, setCenterPct] = useState(20);   // 报告中心：最小宽度
  const [detailPct, setDetailPct] = useState(45);   // 报告详情：较宽
  const [dividerActive, setDividerActive] = useState(false);
  const isDragging = useRef(false);

  // 当前生效的宽度 / setter，根据侧栏模式动态选取
  const panelPct = displayedSidebarMode === 'detail' ? detailPct : centerPct;
  const setPanelPct = displayedSidebarMode === 'detail' ? setDetailPct : setCenterPct;

  const onDividerMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    setDividerActive(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const pct = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
      setPanelPct(Math.min(80, Math.max(20, pct)));
    };
    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setDividerActive(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    // Touch 拖拽支持（移动端分割线）
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const touch = e.touches[0];
      const pct = ((window.innerWidth - touch.clientX) / window.innerWidth) * 100;
      setPanelPct(Math.min(80, Math.max(20, pct)));
    };
    const onTouchEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setDividerActive(false);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <div className="flex h-screen flex-col bg-[var(--background)]">
      {/* 顶部栏 */}
      <header className="flex h-[56px] shrink-0 items-center border-b border-[var(--border)] px-4 sm:px-6">
        {/* 左：品牌标识 */}
        <div className="flex flex-1 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-[var(--accent-foreground)]">
            AI
          </div>
          <span className="text-base font-semibold">AI 学情助手</span>
        </div>

        {/* 中：状态演示 Tabs（仅开发模式） */}
        {import.meta.env.DEV && (
          <div className="flex flex-1 justify-center">
            <Tabs
              selectedKey={view}
              onSelectionChange={(k) => handleViewChange(k as AppView)}
            >
              <Tabs.ListContainer>
                <Tabs.List
                  aria-label="状态演示"
                  className="*:text-xs *:px-3 *:h-7"
                >
                  {VIEWS.map((v) => (
                    <Tabs.Tab key={v.key} id={v.key}>
                      {v.label}
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
          </div>
        )}

        {/* 右：操作按钮区 */}
        <div className="flex flex-1 items-center justify-end gap-2">

          {/* 报告中心入口 */}
          <Button
            variant="ghost"
            size="sm"
            aria-label="报告中心"
            onPress={toggleReportCenter}
            className={[
              'relative flex items-center gap-1.5 px-3',
              sidebarMode === 'center'
                ? 'text-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]'
                : '',
            ].join(' ')}
          >
            <FileText className="size-4 shrink-0" />
            <span className="hidden text-sm sm:inline">报告中心</span>
          </Button>
        </div>
      </header>

      {/* 主体：左侧对话 + 右侧报告面板 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧对话区 */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300">
          <main className="relative flex flex-1 flex-col overflow-hidden">
            <ChatStream
              messages={messages}
              headerSlot={
                showError && view === 'error' ? (
                  <ErrorAlert
                    onRetry={() => {
                      setShowError(false);
                      handleViewChange('loading');
                    }}
                  />
                ) : undefined
              }
              onRetry={handleRetry}
              onDownload={handleDownload}
              onView={handleViewFromChat}
            />
            {/* 顶部渐隐：内容滚到顶栏处柔和淡出 */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[var(--background)] to-transparent" />
            {/* 底部渐隐：内容向输入框柔和淡出，弱化截断硬边 */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--background)] to-transparent" />
          </main>

          <InputBar onSubmit={handleSubmit} isSubmitting={isSubmitting} onStop={handleStop} />
        </div>

        {/* ── 桌面端：分割线 + 侧边面板 ── */}
        {!isMobile && (
          <>
            {panelOpen && (
              <div
                onMouseDown={onDividerMouseDown}
                onTouchStart={() => { isDragging.current = true; setDividerActive(true); }}
                className="group relative z-10 w-2 shrink-0 cursor-col-resize"
              >
                <div
                  className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors duration-150"
                  style={{
                    backgroundColor: dividerActive ? 'var(--accent)' : 'var(--border)',
                  }}
                />
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-1 rounded-full transition-colors duration-150"
                  style={{
                    backgroundColor: dividerActive
                      ? 'var(--accent)'
                      : 'color-mix(in srgb, var(--foreground) 15%, transparent)',
                  }}
                />
              </div>
            )}
            <div
              className="shrink-0 overflow-hidden transition-[width] ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                width: panelOpen ? `${panelPct}%` : 0,
                transitionDuration: isDragging.current ? '0ms' : '400ms',
              }}
            >
              <div className="h-full w-full">
                {/* 列表态：报告中心 */}
                {displayedSidebarMode === 'center' && (
                  <ReportCenterPanel
                    reports={allReports}
                    onSelectReport={handleViewFromCenter}
                    onClose={handleClosePanel}
                    onDownloadAll={() => alert('下载全部报告（演示）')}
                  />
                )}
                {/* 详情态：报告详情 */}
                {displayedSidebarMode === 'detail' && (
                  <ReportPanel
                    report={displayedReport}
                    onClose={handleClosePanel}
                    onDownload={handleDownload}
                    onBack={fromCenter ? handleBackToCenter : undefined}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── 移动端：全屏 overlay 面板 ── */}
      {isMobile && panelOpen && (
        <div className="animate-fade-in fixed inset-0 z-50 flex flex-col bg-[var(--background)]">
          {sidebarMode === 'center' && (
            <ReportCenterPanel
              reports={allReports}
              onSelectReport={handleViewFromCenter}
              onClose={handleClosePanel}
              onDownloadAll={() => alert('下载全部报告（演示）')}
            />
          )}
          {sidebarMode === 'detail' && (
            <ReportPanel
              report={displayedReport}
              onClose={handleClosePanel}
              onDownload={handleDownload}
              onBack={fromCenter ? handleBackToCenter : undefined}
            />
          )}
        </div>
      )}
    </div>
  );
}
