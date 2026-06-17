import { Card, Chip, Tooltip, Skeleton } from '@heroui/react';
import type { StatCard } from '../../types';

interface StatCardItemProps {
  stat: StatCard;
}

function TrendChip({ trend, value }: { trend: StatCard['trend']; value?: string }) {
  if (!trend || trend === 'neutral') {
    return (
      <Chip className="text-xs">
        <Chip.Label>{value ?? '持平'}</Chip.Label>
      </Chip>
    );
  }
  return (
    <Chip className="text-xs" color={trend === 'up' ? 'success' : 'danger'}>
      <Chip.Label>{value}</Chip.Label>
    </Chip>
  );
}

function StatCardItem({ stat }: StatCardItemProps) {
  const content = (
    <Card className="rounded-xl" variant="secondary">
      <Card.Content className="flex flex-col gap-1 p-5">
        <p className="text-xs text-[var(--foreground-secondary)] truncate">{stat.label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold tabular-nums">{stat.value}</span>
          {stat.unit && (
            <span className="text-sm text-[var(--foreground-secondary)]">{stat.unit}</span>
          )}
        </div>
        {stat.trend && (
          <TrendChip trend={stat.trend} value={stat.trendValue} />
        )}
      </Card.Content>
    </Card>
  );

  if (stat.tooltip) {
    return (
      <Tooltip>
        {content}
        <Tooltip.Content>{stat.tooltip}</Tooltip.Content>
      </Tooltip>
    );
  }

  return content;
}

function StatCardSkeleton() {
  return (
    <Card className="rounded-xl" variant="secondary">
      <Card.Content className="flex flex-col gap-2 p-5">
        <Skeleton className="h-3 w-16 rounded-[4px]" />
        <Skeleton className="h-7 w-20 rounded-[4px]" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </Card.Content>
    </Card>
  );
}

interface StatCardGroupProps {
  stats?: StatCard[];
  isLoading?: boolean;
}

export function StatCardGroup({ stats, isLoading }: StatCardGroupProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  if (!stats || stats.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, i) => (
        <StatCardItem key={i} stat={stat} />
      ))}
    </div>
  );
}
