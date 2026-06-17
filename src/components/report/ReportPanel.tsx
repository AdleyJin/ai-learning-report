import { Button, Skeleton } from '@heroui/react';
import { ArrowRotateRight, ArrowDownToLine, Xmark, ChevronLeft } from '@gravity-ui/icons';
import type { Report } from '../../types';
import { StatCardGroup } from './StatCardGroup';
import { ChartCard, AnalysisCard } from './ChartCard';

interface ReportPanelProps {
  report: Report | null;
  onClose: () => void;
  onDownload?: (report: Report) => void;
  /** 从报告中心进入时提供，点击后返回报告列表 */
  onBack?: () => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-tertiary)]">
      {children}
    </h3>
  );
}

function ComingSoonSection() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-3 rounded-[4px]" style={{ width: `${70 + i * 8}%` }} />
          <Skeleton className="h-3 rounded-[4px]" style={{ width: `${50 + i * 10}%` }} />
        </div>
      ))}
      <p className="mt-3 text-center text-xs text-[var(--foreground-tertiary)]">此模块即将上线</p>
    </div>
  );
}

export function ReportPanel({ report, onClose, onDownload, onBack }: ReportPanelProps) {
  if (!report) return null;

  const isLoading = report.status === 'loading';

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--background)]">
      {/* 标题栏 */}
      <div className="flex h-[56px] shrink-0 items-center gap-1 border-b border-[var(--border)] px-4">
        {/* 左：返回按钮（从报告中心进入时）+ 标题 + 格式·时间 */}
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
          {onBack && (
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              aria-label="返回报告列表"
              onPress={onBack}
              className="shrink-0"
            >
              <ChevronLeft width={16} height={16} />
            </Button>
          )}
          <div className="flex min-w-0 flex-col justify-center overflow-hidden">
            <h2 className="truncate text-sm font-semibold leading-tight">{report.title}</h2>
            {(report.generatedAt || report.formats?.length) && (
              <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                {[
                  report.formats?.length ? report.formats[0].toUpperCase() : null,
                  report.generatedAt?.split(' ')[0],
                ].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>

        {/* 右：下载、刷新、关闭（均为 icon-only） */}
        <div className="flex shrink-0 items-center gap-1">
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            aria-label="下载报告"
            isDisabled={isLoading}
            onPress={() => onDownload?.(report)}
          >
            <ArrowDownToLine width={16} height={16} />
          </Button>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            aria-label="刷新报告"
            isDisabled={isLoading}
          >
            <ArrowRotateRight width={16} height={16} />
          </Button>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            aria-label="关闭面板"
            onPress={onClose}
          >
            <Xmark width={16} height={16} />
          </Button>
        </div>
      </div>

      {/* 瀑布流内容区（可滚动） */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-8 px-4 py-6">
          {/* 总览 */}
          <section className="flex flex-col gap-4">
            <SectionTitle>总览</SectionTitle>
            <StatCardGroup stats={report.stats} isLoading={isLoading} />
          </section>

          {/* 趋势图表 */}
          <section className="flex flex-col gap-4">
            <SectionTitle>趋势</SectionTitle>
            <ChartCard isLoading={isLoading} />
          </section>

          {/* 分析摘要 */}
          <section className="flex flex-col gap-4">
            <SectionTitle>分析摘要</SectionTitle>
            <AnalysisCard text={report.analysisText} isLoading={isLoading} />
          </section>

          {/* 知识点分析 */}
          <section className="flex flex-col gap-4">
            <SectionTitle>知识点分析</SectionTitle>
            <ComingSoonSection />
          </section>

          {/* 学生详情 */}
          <section className="flex flex-col gap-4">
            <SectionTitle>学生详情</SectionTitle>
            <ComingSoonSection />
          </section>
        </div>
      </div>
    </div>
  );
}
