import { Card, ProgressCircle, Skeleton } from '@heroui/react';

interface ChartCardProps {
  isLoading?: boolean;
}

function BarChart() {
  const data = [
    { label: '周一', value: 82 },
    { label: '周二', value: 88 },
    { label: '周三', value: 85 },
    { label: '周四', value: 91 },
    { label: '周五', value: 87 },
  ];
  const max = 100;

  return (
    <div className="flex h-[160px] items-end justify-between gap-2 px-2">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] text-[var(--foreground-secondary)]">{d.value}</span>
          <div
            className="w-full rounded-t-sm bg-[var(--accent)] transition-all duration-500"
            style={{ height: `${(d.value / max) * 140}px` }}
            role="img"
            aria-label={`${d.label}: ${d.value}分`}
          />
          <span className="text-[10px] text-[var(--foreground-secondary)]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ChartCard({ isLoading }: ChartCardProps) {
  return (
    <Card className="w-full min-h-[200px] rounded-xl">
      <Card.Header className="pb-2">
        <Card.Title className="text-sm font-semibold">本周每日平均分趋势</Card.Title>
      </Card.Header>
      <Card.Content className="pt-0">
        {isLoading ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-3">
            <ProgressCircle
              isIndeterminate
              aria-label="图表加载中"
              className="size-8 text-[var(--accent)]"
            >
              <ProgressCircle.Track>
                <ProgressCircle.TrackCircle />
                <ProgressCircle.FillCircle />
              </ProgressCircle.Track>
            </ProgressCircle>
            <span className="text-xs text-[var(--foreground-secondary)]">
              报告生成中，请稍候…
            </span>
          </div>
        ) : (
          <BarChart />
        )}
      </Card.Content>
    </Card>
  );
}

interface AnalysisCardProps {
  text?: string;
  isLoading?: boolean;
}

export function AnalysisCard({ text, isLoading }: AnalysisCardProps) {
  return (
    <Card className="w-full rounded-xl">
      <Card.Header className="pb-2">
        <Card.Title className="text-sm font-semibold">分析摘要</Card.Title>
      </Card.Header>
      <Card.Content className="pt-0">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-3 rounded-[4px]"
                style={{ width: ['100%', '90%', '95%', '85%', '60%'][i] }}
              />
            ))}
          </div>
        ) : (
          <div className="prose prose-sm max-w-none text-sm leading-relaxed text-[var(--foreground)]">
            {text?.split('\n\n').map((paragraph, i) => (
              <p key={i} className="mb-3 last:mb-0">
                {paragraph.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                  part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={j}>{part.slice(2, -2)}</strong>
                  ) : (
                    part
                  )
                )}
              </p>
            ))}
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
