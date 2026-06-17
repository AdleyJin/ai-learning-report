export function EmptyState() {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 px-4 py-8">
      <svg
        className="text-[var(--foreground-tertiary,theme(colors.neutral.400))] opacity-40"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
      <p className="text-sm text-[var(--foreground-secondary,theme(colors.neutral.500))]">
        暂无报告
      </p>
      <p className="max-w-[240px] text-center text-xs text-[var(--foreground-tertiary,theme(colors.neutral.400))] opacity-70">
        选择模版并填写分析内容，生成你的第一份学情报告。
      </p>
    </div>
  );
}
