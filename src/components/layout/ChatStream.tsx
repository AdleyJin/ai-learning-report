import { useRef, useLayoutEffect, useState } from 'react';
import type { ChatMessage, Report } from '../../types';
import { AgentReplyCard, UserMessage, ThinkingIndicator, ActionBar, TypewriterText } from '../report/AgentReplyCard';
import { ReportCard } from '../report/ReportCard';
import { AgentProgressCard } from '../report/AgentProgressCard';
import { EmptyState } from '../states/EmptyState';

interface ChatStreamProps {
  messages: ChatMessage[];
  headerSlot?: React.ReactNode;
  onRetry?: (messageId: string) => void;
  onDownload?: (report: Report) => void;
  onView?: (report: Report) => void;
}

/* 新用户消息置顶时，顶部预留的呼吸间距 */
const TOP_OFFSET = 24;

export function ChatStream({ messages, headerSlot, onRetry, onDownload, onView }: ChatStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [spacerHeight, setSpacerHeight] = useState(0);
  const lastUserIdRef = useRef<string | null>(null);
  // 用第一条消息的 id 来识别"整个对话被替换"（tab 切换 / setMessages）
  const firstMsgIdRef = useRef<string | null>(null);

  // 最近一条用户消息
  const lastUserId =
    [...messages].reverse().find((m) => m.role === 'user')?.id ?? null;
  const firstMsgId = messages[0]?.id ?? null;

  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    // 对话被整体替换（tab 切换 / 初始挂载）：重置 spacer，直接贴底显示内容
    if (firstMsgId !== firstMsgIdRef.current) {
      firstMsgIdRef.current = firstMsgId;
      lastUserIdRef.current = lastUserId;
      setSpacerHeight(0);
      // 用 instant 滚到底，让历史消息从底部可见
      scrollEl.scrollTop = scrollEl.scrollHeight;
      return;
    }

    // 出现了新一轮对话（用户发送了新消息）：把这条用户消息锚定到视口顶部
    if (lastUserId && lastUserId !== lastUserIdRef.current) {
      lastUserIdRef.current = lastUserId;

      const userEl = scrollEl.querySelector<HTMLElement>(
        `[data-msg-id="${lastUserId}"]`,
      );
      if (!userEl) return;

      // 动态占位：保证内容较短时也能把用户消息推到顶部（发送时计算一次，流式中不重算以避免抖动）
      const needed = scrollEl.clientHeight - TOP_OFFSET - userEl.offsetHeight;
      setSpacerHeight(Math.max(0, needed));

      // 占位生效后再平滑滚动，使用户消息顶部对齐滚动容器顶部
      requestAnimationFrame(() => {
        const delta =
          userEl.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top - TOP_OFFSET;
        scrollEl.scrollTo({ top: scrollEl.scrollTop + delta, behavior: 'smooth' });
      });
    }
  }, [messages, lastUserId, firstMsgId]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState />
      </div>
    );
  }

  return (
    /* 全宽滚动容器 → 滚动条贴边；内容由子元素 max-w 居中 */
    <div ref={scrollRef} className="chat-scroll flex flex-1 flex-col overflow-y-auto py-8">
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8 px-3 sm:px-0">
      {headerSlot && <div>{headerSlot}</div>}
      {messages.map((msg) => (
        <div key={msg.id} data-msg-id={msg.id} data-role={msg.role}>
          {msg.role === 'user' ? (
            <UserMessage content={msg.content} timestamp={msg.timestamp} />
          ) : (
            <div className="flex flex-col gap-5">
              {/* Thinking 阶段：仅显示点动画，无 avatar 无步骤无卡片 */}
              {msg.isThinking ? (
                <ThinkingIndicator />
              ) : (
                <div className="animate-fade-in flex flex-col gap-4">
                  {/* AI 消息头部 */}
                  <AgentReplyCard
                    content={msg.content}
                    timestamp={msg.timestamp}
                    animate={msg.animateContent}
                  />

                  {/* Agent 交互步骤 */}
                  {msg.agentSteps && msg.agentSteps.length > 0 && (
                    <AgentProgressCard
                      steps={msg.agentSteps}
                      executionSummary={msg.executionSummary}
                    />
                  )}

                  {/* 报告文字总结：新生成时走打字动效，历史消息直接展示 */}
                  {msg.reportSummary && (
                    <div className="px-1">
                      {msg.animateContent ? (
                        <TypewriterText text={msg.reportSummary} />
                      ) : (
                        msg.reportSummary.split('\n\n').map((para, i) => (
                          <p key={i} className={`text-sm leading-relaxed text-[var(--foreground)] ${i > 0 ? 'mt-3' : ''}`}>
                            {para}
                          </p>
                        ))
                      )}
                    </div>
                  )}

                  {/* 报告卡片 */}
                  {msg.report && (
                    <div className="px-1">
                      <ReportCard
                        report={msg.report}
                        onView={() => onView?.(msg.report!)}
                        onDownload={() => onDownload?.(msg.report!)}
                        onRetry={() => onRetry?.(msg.id)}
                      />
                    </div>
                  )}

                  {/* 工具栏：仅在报告生成完成后显示 */}
                  {msg.report?.status === 'completed' && (
                    <div className="px-1">
                      <ActionBar />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {/* 动态底部占位：把最新一轮用户消息推到视口顶部（瞬间到位，靠平滑滚动呈现推升动效） */}
      <div aria-hidden className="shrink-0" style={{ height: spacerHeight }} />
      </div>
    </div>
  );
}
