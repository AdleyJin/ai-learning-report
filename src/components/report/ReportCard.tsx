import { Card, Button, Skeleton, ProgressCircle } from '@heroui/react';
import { FileText, TriangleExclamation, ArrowDownToLine } from '@gravity-ui/icons';
import type { Report } from '../../types';

interface ReportCardProps {
  report: Report;
  onView?: () => void;
  onDownload?: () => void;
  onRetry?: () => void;
}

/* ── 加载态 ── */
function ReportCardLoading() {
  return (
    <Card className="w-full !rounded-lg">
      <Card.Content>
        <div className="flex items-center gap-3">
          <ProgressCircle
            isIndeterminate
            aria-label="生成中"
            className="size-5 shrink-0 text-[var(--accent)]"
          >
            <ProgressCircle.Track>
              <ProgressCircle.TrackCircle />
              <ProgressCircle.FillCircle />
            </ProgressCircle.Track>
          </ProgressCircle>
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-2/5 rounded-[4px]" />
            <Skeleton className="h-3 w-3/5 rounded-[4px]" />
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}

/* ── 完成态 ── */
function ReportCardCompleted({ report, onView, onDownload }: ReportCardProps) {
  return (
    <Card
      className="w-full !rounded-lg cursor-pointer"
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && onView?.()}
    >
      <Card.Content>
        <div className="flex items-center gap-3">
          {/* 左：icon + 标题 + 说明 */}
          <FileText width={18} height={18} className="shrink-0 text-[var(--accent)]" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold text-[var(--foreground)]">
              {report.title}
            </span>
            {report.formats?.length > 0 && (
              <span className="mt-0.5 truncate text-xs text-[var(--muted)]">
                {report.formats[0].toUpperCase()}
              </span>
            )}
          </div>
          {/* 右：下载按钮 */}
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Button variant="tertiary" size="sm" onPress={onDownload}>
              <ArrowDownToLine width={14} height={14} />
              下载
            </Button>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}

/* ── 错误态 ── */
function ReportCardError({ report, onRetry }: ReportCardProps) {
  return (
    <Card className="w-full !rounded-lg border-[var(--danger)]/30">
      <Card.Content>
        <div className="flex items-center gap-3">
          <TriangleExclamation width={18} height={18} className="shrink-0 text-[var(--danger)]" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold text-[var(--foreground)]">
              {report.title}生成失败
            </span>
            <span className="mt-0.5 truncate text-xs text-[var(--danger)]">
              {report.errorMessage ?? 'Agent 生成过程中遇到错误，请重试或联系管理员。'}
            </span>
          </div>
          <Button variant="ghost" size="sm" onPress={onRetry}>
            重试
          </Button>
        </div>
      </Card.Content>
    </Card>
  );
}

export function ReportCard(props: ReportCardProps) {
  const { report } = props;
  if (report.status === 'loading')  return <ReportCardLoading />;
  if (report.status === 'error')    return <ReportCardError {...props} />;
  return <ReportCardCompleted {...props} />;
}
