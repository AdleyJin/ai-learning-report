import { useState, useEffect, useRef } from 'react';
import {
  Magnifier,
  BookOpen,
  Terminal,
  PencilToSquare,
  Play,
  File,
  CircleCheck,
  CircleXmark,
  ChevronUp,
  ChevronDown,
  ListCheck,
  Wrench,
  FileCheck,
} from '@gravity-ui/icons';
import type { AgentStep, AgentStepType, ExecutionSummary } from '../../types';

interface AgentProgressCardProps {
  steps: AgentStep[];
  executionSummary?: ExecutionSummary;
}

/* ─── 与 ThinkingIndicator 同款的环形 spinner ─── */
function SpinnerRing({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={`animate-spin ${className}`}>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─── 按 type 映射图标 ─── */
function StepIcon({ type, size = 15 }: { type?: AgentStepType; size?: number }) {
  const p = { width: size, height: size };
  switch (type) {
    case 'search':   return <Magnifier {...p} />;
    case 'read':     return <BookOpen {...p} />;
    case 'terminal': return <Terminal {...p} />;
    case 'create':   return <PencilToSquare {...p} />;
    case 'run':      return <Play {...p} />;
    case 'file':     return <File {...p} />;
    case 'check':    return <CircleCheck {...p} />;
    case 'plan':     return <ListCheck {...p} />;
    case 'tools':    return <Wrench {...p} />;
    case 'report':   return <FileCheck {...p} />;
    default:         return <CircleCheck {...p} />;
  }
}

/* ─── 单步行 ─── */
function StepRow({ step, isLast }: { step: AgentStep; isLast: boolean }) {
  const iconColor =
    step.status === 'error' ? 'text-[var(--danger)]'
    :                         'text-[var(--muted)]';

  const labelColor =
    step.status === 'error'     ? 'text-[var(--danger)]'
    : step.status === 'pending' ? 'text-[var(--muted)] opacity-60'
    :                             'text-[var(--muted)]';

  return (
    <div className="animate-step-fade-in flex gap-3 pb-1">
      {/* 图标列 + 连接线 */}
      <div className={`flex w-5 shrink-0 flex-col items-center ${iconColor}`}>
        <div className="flex h-5 w-5 items-center justify-center">
          {step.status === 'active' ? (
            <SpinnerRing size={15} />
          ) : step.status === 'error' ? (
            <CircleXmark width={15} height={15} />
          ) : (
            <StepIcon type={step.type} size={15} />
          )}
        </div>
        {!isLast && (
          <div className="mt-1 w-px flex-1 min-h-[12px] bg-[var(--border)]" />
        )}
      </div>

      {/* 文字 */}
      <div className="self-start flex flex-col justify-center" style={{ minHeight: '20px' }}>
        <span className={`text-sm leading-5 transition-colors duration-300 ${labelColor}`}>
          {step.label}
        </span>
      </div>
    </div>
  );
}

/* ─── 主组件 ─── */
export function AgentProgressCard({ steps, executionSummary }: AgentProgressCardProps) {
  const allDone  = steps.length > 0 && steps.every((s) => s.status === 'done');
  const hasError = steps.some((s) => s.status === 'error');
  const isRunning = !allDone && !hasError;

  // 惰性初始化：挂载时已完成则直接折叠（无动画）；只有运行中→完成的转变才触发收起动效
  const [collapsed, setCollapsed] = useState(() => allDone && !hasError);
  const mountedAsDone = useRef(allDone && !hasError);

  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(Date.now());

  /* 计时 */
  useEffect(() => {
    if (isRunning) {
      startRef.current = Date.now();
      timerRef.current = setInterval(() => setElapsedMs(Date.now() - startRef.current), 200);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  /* 完成时折叠——仅当本次是从运行中转为完成（非初始已完成）才触发带动效的收起 */
  useEffect(() => {
    if (allDone && !hasError && !mountedAsDone.current) {
      setCollapsed(true);
    }
  }, [allDone, hasError]);

  const totalSeconds = Math.max(1, Math.round(elapsedMs / 1000));

  /* ── 阶段一（无步骤）不渲染 ── */
  if (steps.length === 0) return null;

  /* ── Header 文案 ── */
  const summaryText = executionSummary
    ? [
        executionSummary.commandsRun  ? `共运行了 ${executionSummary.commandsRun} 条命令` : '',
        executionSummary.filesRead    ? `查看了 ${executionSummary.filesRead} 个文件` : '',
        executionSummary.filesCreated ? `创建了 ${executionSummary.filesCreated} 个文件` : '',
      ].filter(Boolean).join('，')
    : `已完成 · ${totalSeconds}s`;

  const headerText = hasError
    ? '执行时遇到错误'
    : isRunning
      ? '正在执行…'
      : summaryText;

  return (
    <div className="px-1">
      {/* ── Header 按钮（icon 列与步骤 icon 列等宽对齐） ── */}
      <button
        type="button"
        onClick={() => (allDone || hasError) && setCollapsed((c) => !c)}
        className={[
          'flex items-center gap-3 rounded-md px-0 py-0.5 text-sm',
          'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          allDone || hasError ? 'cursor-pointer' : 'cursor-default',
          hasError ? 'text-[var(--danger)]' : 'text-[var(--muted)]',
        ].join(' ')}
        aria-expanded={!collapsed}
      >
        {/* 运行中 / 出错时显示 icon（与步骤 icon 列等宽对齐）；完成后不占位 */}
        {(isRunning || hasError) && (
          <div className="flex w-5 shrink-0 items-center justify-center">
            {isRunning
              ? <SpinnerRing size={15} />
              : <CircleXmark width={15} height={15} />}
          </div>
        )}
        <span className="transition-[color,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
          {headerText}
        </span>
        {(allDone || hasError) && (
          <span className="transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {collapsed ? <ChevronDown width={12} height={12} /> : <ChevronUp width={12} height={12} />}
          </span>
        )}
      </button>

      {/* ── 步骤列表（collapsible，缓动）── */}
      <div
        className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ gridTemplateRows: collapsed ? '0fr' : '1fr' }}
      >
        <div className="overflow-hidden">
          <div className="pb-1 pt-4">
            {steps.map((step, idx) => (
              <StepRow key={step.id} step={step} isLast={idx === steps.length - 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
