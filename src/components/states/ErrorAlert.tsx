import { Card, Button } from '@heroui/react';
import { TriangleExclamation } from '@gravity-ui/icons';

interface ErrorAlertProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <Card className="w-full !rounded-lg border-[var(--danger)]/30">
      <Card.Content>
        <div className="flex items-center gap-3">
          {/* 左：icon + 标题 + 说明 */}
          <TriangleExclamation width={18} height={18} className="shrink-0 text-[var(--danger)]" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold text-[var(--foreground)]">
              报告生成失败
            </span>
            <span className="mt-0.5 truncate text-xs text-[var(--danger)]">
              {message ?? 'Agent 生成过程中遇到错误，请重试或联系管理员。'}
            </span>
          </div>
          {/* 右：重试按钮 */}
          {onRetry && (
            <Button variant="ghost" size="sm" onPress={onRetry}>
              重试
            </Button>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}
