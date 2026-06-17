import { useState, useEffect } from 'react';
import { Button, Tooltip } from '@heroui/react';
import {
  Copy,
  CopyCheck,
  ThumbsUp,
  ThumbsDown,
  ArrowRotateRight,
  Ellipsis,
  Sparkles,
} from '@gravity-ui/icons';

/* ─── 阶段一：星形旋转 Loading（PRD：星形旋转 Loading 图标）─── */
export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 px-1 py-1">
      <span className="animate-thinking-spin text-[var(--foreground-secondary)]">
        <Sparkles width={16} height={16} />
      </span>
      <span className="text-sm text-[var(--foreground-secondary)]">思考中…</span>
    </div>
  );
}

/* ─── User Message ─── */
interface UserMessageProps {
  content: string;
  timestamp?: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex justify-end px-1">
      <div className="max-w-[72%] rounded-2xl rounded-tr-sm bg-[var(--surface)] px-4 py-2.5">
        <p className="text-sm leading-relaxed text-[var(--foreground)]">{content}</p>
      </div>
    </div>
  );
}

/* ─── Action Bar ─── */
interface ActionBarProps {
  onCopy?: () => void;
  onRetry?: () => void;
}

export function ActionBar({ onCopy, onRetry }: ActionBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 1500);
  };

  const actions = [
    {
      key: 'copy',
      label: copied ? '已复制' : '复制',
      icon: copied
        ? <CopyCheck width={15} height={15} />
        : <Copy width={15} height={15} />,
      onPress: handleCopy,
    },
    { key: 'like',   label: '赞',       icon: <ThumbsUp width={15} height={15} />,       onPress: undefined },
    { key: 'dislike',label: '踩',       icon: <ThumbsDown width={15} height={15} />,     onPress: undefined },
    { key: 'retry',  label: '重新生成', icon: <ArrowRotateRight width={15} height={15} />, onPress: onRetry },
    { key: 'more',   label: '更多',     icon: <Ellipsis width={15} height={15} />,        onPress: undefined },
  ];

  return (
    <div className="mt-2 flex items-center gap-0.5">
      {actions.map(({ key, label, icon, onPress }) => (
        <Tooltip key={key} delay={300}>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            aria-label={label}
            onPress={onPress}
            className="h-7 w-7 text-[var(--muted)]"
          >
            {icon}
          </Button>
          <Tooltip.Content>
            <p className="text-xs">{label}</p>
          </Tooltip.Content>
        </Tooltip>
      ))}
    </div>
  );
}

/* ─── 逐字输出文本（支持多段落） ─── */
interface TypewriterTextProps {
  text: string;
  speed?: number;
}

export function TypewriterText({ text, speed = 30 }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (displayed >= text.length) return;
    const delay = speed + Math.random() * 16;
    const t = setTimeout(() => setDisplayed((d) => d + 1), delay);
    return () => clearTimeout(t);
  }, [displayed, text.length, speed]);

  const isDone = displayed >= text.length;
  const paragraphs = text.slice(0, displayed).split('\n\n');

  return (
    <>
      {paragraphs.map((para, i) => (
        <p
          key={i}
          className={`text-sm leading-relaxed text-[var(--foreground)] ${i > 0 ? 'mt-3' : ''}`}
        >
          {para}
          {!isDone && i === paragraphs.length - 1 && (
            <span className="animate-cursor-pulse ml-0.5 inline-block h-[1em] w-px translate-y-[1px] bg-current opacity-80" />
          )}
        </p>
      ))}
    </>
  );
}

/* ─── Agent Reply Card ─── */
interface AgentReplyCardProps {
  content: string;
  timestamp: string;
  animate?: boolean;
}

export function AgentReplyCard({ content, animate }: AgentReplyCardProps) {
  const [displayed, setDisplayed] = useState(animate ? 0 : content.length);

  useEffect(() => {
    if (!animate || displayed >= content.length) return;
    // 每个字符 38ms，带轻微随机感
    const delay = 30 + Math.random() * 16;
    const t = setTimeout(() => setDisplayed((d) => d + 1), delay);
    return () => clearTimeout(t);
  }, [animate, displayed, content.length]);

  const isDone = displayed >= content.length;

  return (
    <div className="px-1">
      <p className="text-sm leading-relaxed text-[var(--foreground)]">
        {content.slice(0, displayed)}
        {/* 打字游标：未完成时闪烁，完成后消失 */}
        {animate && !isDone && (
          <span className="animate-cursor-pulse ml-0.5 inline-block h-[1em] w-px translate-y-[1px] bg-current opacity-80" />
        )}
      </p>
    </div>
  );
}
