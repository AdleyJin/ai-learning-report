import { useMemo, useState } from 'react';
import {
  Button,
  Chip,
  InputGroup,
  ListBox,
  Select,
  TextField,
  Tooltip,
} from '@heroui/react';
import { ArrowUp, ChevronDown, FileText, Paperclip, Xmark } from '@gravity-ui/icons';
import { REPORT_TEMPLATES } from '../../data/mock';
import type { InputFormValues, ReportSubTemplate } from '../../types';

interface InputBarProps {
  onSubmit: (values: InputFormValues) => void;
  isSubmitting?: boolean;
  onStop?: () => void;
}

export function InputBar({ onSubmit, isSubmitting, onStop }: InputBarProps) {
  const [prompt, setPrompt] = useState('');
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [subId, setSubId] = useState<string | null>(null);

  const template = useMemo(
    () => REPORT_TEMPLATES.find((t) => t.id === templateId) ?? null,
    [templateId],
  );

  const canSend = Boolean(prompt.trim()) && !isSubmitting;
  const placeholder = template
    ? template.defaultPrompt
    : '想生成什么报告？例如：帮我生成三年级 A 班本周学情报告…';

  const handlePickTemplate = (id: string) => {
    setTemplateId(id);
    setSubId(null);
  };

  const handleClearTemplate = () => {
    setTemplateId(null);
    setSubId(null);
  };

  const handlePickSub = (sub: ReportSubTemplate) => {
    setSubId(sub.id);
    setPrompt(sub.prompt);
  };

  const handleSubmit = () => {
    if (!canSend) return;
    onSubmit({ prompt: prompt.trim(), templateId: templateId ?? 'weekly' });
    setPrompt('');
    setSubId(null);
    setTemplateId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-[var(--background)] px-3 py-3 sm:px-6 sm:py-4">
      <div className="mx-auto w-full max-w-[720px]">
        {/* 子模版面板：选中模版后在对话框上方弹出 */}
        {template && template.subTemplates.length > 0 && (
          <div className="animate-fade-in mb-2 flex gap-2 overflow-x-auto pb-1">
            {template.subTemplates.map((sub) => {
              const active = sub.id === subId;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handlePickSub(sub)}
                  className={[
                    'flex min-w-[132px] shrink-0 flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left transition-colors',
                    active
                      ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]'
                      : 'border-[var(--border)] bg-[var(--background)] hover:bg-[var(--surface-secondary)]',
                  ].join(' ')}
                >
                  <span className="text-sm font-medium text-[var(--foreground)]">{sub.name}</span>
                  <span className="text-xs text-[var(--foreground-secondary)]">
                    {sub.description}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <TextField fullWidth aria-label="对话输入" className="flex w-full flex-col" name="prompt">
          <InputGroup
            fullWidth
            className="flex flex-col gap-4 rounded-2xl py-3 !shadow-none hover:!bg-field hover:!border-[var(--field-border)] focus-within:!bg-field"
          >
            {/* 已选模版标签 + 输入框：同一行 */}
            <div className="flex w-full flex-col items-start gap-2 px-3.5">
              {template && (
                <Chip color="accent" variant="soft" className="mt-1 shrink-0 gap-1 pr-1">
                  <Chip.Label>{template.name}</Chip.Label>
                  <button
                    type="button"
                    aria-label="移除模版"
                    onClick={handleClearTemplate}
                    className="flex size-4 items-center justify-center rounded-full text-current opacity-70 transition-opacity hover:opacity-100"
                  >
                    <Xmark className="size-3.5" />
                  </button>
                </Chip>
              )}
              <InputGroup.TextArea
                className="w-full min-w-0 flex-1 resize-none px-0 py-0 leading-normal"
                placeholder={placeholder}
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <InputGroup.Suffix className="flex w-full items-center gap-1.5 px-3 py-0">
              {/* 附件按钮 */}
              <Tooltip delay={0}>
                <Button isIconOnly aria-label="添加附件" variant="outline" className="text-[var(--muted)]">
                  <Paperclip />
                </Button>
                <Tooltip.Content>
                  <p className="text-xs">添加附件</p>
                </Tooltip.Content>
              </Tooltip>

              {/* 报告模版选择 */}
              <Select
                selectedKey={templateId}
                onSelectionChange={(key) => handlePickTemplate(String(key))}
                aria-label="报告模版"
              >
                <Tooltip delay={0}>
                  <Select.Trigger className="items-center !justify-center gap-1 rounded-full border border-[var(--border)] bg-transparent px-3 text-xs shadow-none hover:bg-[color-mix(in_srgb,var(--default)_60%,transparent)]">
                    <FileText className="size-4 shrink-0 text-[var(--muted)]" />
                    <span className="shrink-0 text-[var(--foreground)]">报告</span>
                    <ChevronDown className="size-3.5 shrink-0 text-[var(--muted)]" />
                  </Select.Trigger>
                  <Tooltip.Content>
                    <p className="text-xs">选择报告模版</p>
                  </Tooltip.Content>
                </Tooltip>
                <Select.Popover>
                  <ListBox>
                    {REPORT_TEMPLATES.map((tpl) => (
                      <ListBox.Item key={tpl.id} id={tpl.id} textValue={tpl.name}>
                        {tpl.name}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>

              {/* 发送 / 停止按钮 */}
              <div className="ml-auto flex items-center">
                {isSubmitting ? (
                  <Tooltip delay={0}>
                    <Button
                      isIconOnly
                      aria-label="停止生成"
                      className="rounded-full"
                      onPress={onStop}
                    >
                      <span className="block h-[13px] w-[13px] rounded-[3px] bg-current" />
                    </Button>
                    <Tooltip.Content>
                      <p className="text-xs">停止生成</p>
                    </Tooltip.Content>
                  </Tooltip>
                ) : (
                  <Tooltip delay={0}>
                    <Button
                      isIconOnly
                      aria-label="发送"
                      className="rounded-full"
                      isDisabled={!canSend}
                      onPress={handleSubmit}
                    >
                      <ArrowUp />
                    </Button>
                    <Tooltip.Content>
                      <p className="text-xs">发送（Enter）</p>
                    </Tooltip.Content>
                  </Tooltip>
                )}
              </div>
            </InputGroup.Suffix>
          </InputGroup>
        </TextField>

        <p className="mt-2 text-center text-xs text-[var(--field-placeholder)]">
          AI 生成内容仅供参考，请核对关键信息。
        </p>
      </div>
    </div>
  );
}
