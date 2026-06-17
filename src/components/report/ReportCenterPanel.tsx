import { Button } from '@heroui/react';
import { Xmark, FileText } from '@gravity-ui/icons';
import type { Report } from '../../types';
import { ReportCard } from './ReportCard';

interface ReportCenterPanelProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  onClose: () => void;
  onDownloadAll?: () => void;
}

function EmptyState() {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-6 py-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[var(--foreground-tertiary)]">
        <FileText width={22} height={22} />
      </div>
      <p className="text-sm font-medium text-[var(--foreground-secondary)]">暂无报告</p>
      <p className="max-w-[220px] text-center text-xs leading-relaxed text-[var(--foreground-tertiary)]">
        生成你的第一份学情报告后，会在这里集中展示。
      </p>
    </div>
  );
}

export function ReportCenterPanel({
  reports,
  onSelectReport,
  onClose,
  onDownloadAll,
}: ReportCenterPanelProps) {
  const completedCount = reports.filter((r) => r.status === 'completed').length;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--background)]">
      {/* 标题栏 */}
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-[var(--border)] px-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">报告中心</h2>
          {completedCount > 0 && (
            <span className="text-xs font-medium text-[var(--foreground-secondary)]">
              {completedCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            isDisabled={completedCount === 0}
            onPress={onDownloadAll}
          >
            下载全部
          </Button>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            aria-label="关闭报告中心"
            onPress={onClose}
          >
            <Xmark width={16} height={16} />
          </Button>
        </div>
      </div>

      {/* 列表区：复用对话流中的 ReportCard 样式 */}
      <div className="flex-1 overflow-y-auto">
        {reports.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-3 px-4 py-4">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onView={report.status === 'completed' ? () => onSelectReport(report) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
