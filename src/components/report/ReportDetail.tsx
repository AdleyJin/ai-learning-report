import { useState } from 'react';
import {
  Modal,
  Drawer,
  Button,
  Tabs,
  Chip,
} from '@heroui/react';
import type { Report } from '../../types';
import { StatCardGroup } from './StatCardGroup';
import { ChartCard, AnalysisCard } from './ChartCard';

interface ReportDetailProps {
  report: Report;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
  isMobile?: boolean;
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ReportDetailContent({
  report,
}: Pick<ReportDetailProps, 'report'>) {
  const isLoading = report.status === 'loading';
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <Tabs
      selectedKey={activeTab}
      onSelectionChange={(key) => setActiveTab(String(key))}
      className="w-full"
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label="报告模块">
          <Tabs.Tab id="overview">
            总览
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="knowledge">
            知识点分析
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="students">
            学生详情
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>

      <Tabs.Panel id="overview">
        <div className="flex flex-col gap-6 py-4">
          <StatCardGroup stats={report.stats} isLoading={isLoading} />
          <ChartCard isLoading={isLoading} />
          <AnalysisCard text={report.analysisText} isLoading={isLoading} />
        </div>
      </Tabs.Panel>

      <Tabs.Panel id="knowledge">
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 py-8 text-sm text-[var(--muted)]">
          <p>知识点分析模块开发中</p>
        </div>
      </Tabs.Panel>

      <Tabs.Panel id="students">
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 py-8 text-sm text-[var(--muted)]">
          <p>学生详情模块开发中</p>
        </div>
      </Tabs.Panel>
    </Tabs>
  );
}

export function ReportDetail({
  report,
  isOpen,
  onClose,
  onDownload,
  isMobile,
}: ReportDetailProps) {
  if (isMobile) {
    return (
      <Drawer.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Drawer.Content>
          <Drawer.Dialog className="max-h-[90vh]">
            <Drawer.Handle />
            <Drawer.CloseTrigger />
            <Drawer.Header className="flex flex-row items-center justify-between pr-10">
              <div className="flex items-center gap-2 overflow-hidden">
                <Drawer.Heading className="truncate text-base font-semibold">
                  {report.title}
                </Drawer.Heading>
                {report.generatedAt && (
                  <Chip className="shrink-0 text-xs">
                    <Chip.Label>{report.generatedAt.split(' ')[0]}</Chip.Label>
                  </Chip>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onPress={onDownload}
                aria-label="下载报告"
                className="mr-2 shrink-0"
                isIconOnly
              >
                <DownloadIcon />
              </Button>
            </Drawer.Header>
              <Drawer.Body className="overflow-y-auto px-4 pb-6">
              <ReportDetailContent report={report} />
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    );
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Container>
        <Modal.Dialog className="w-full max-w-[860px]" style={{ maxHeight: '600px' }}>
          <Modal.CloseTrigger />
          <Modal.Header className="flex flex-row items-center justify-between border-b border-[var(--border)] pb-4 pr-12">
            <div className="flex items-center gap-3 overflow-hidden">
              <Modal.Heading className="truncate text-xl font-semibold">
                {report.title}
              </Modal.Heading>
              {report.generatedAt && (
                <Chip className="shrink-0 text-xs">
                  <Chip.Label>{report.generatedAt.split(' ')[0]}</Chip.Label>
                </Chip>
              )}
            </div>
            <Button
              variant="primary"
              size="sm"
              onPress={onDownload}
              className="mr-2 shrink-0"
            >
              <DownloadIcon />
              下载
            </Button>
          </Modal.Header>
          <Modal.Body className="overflow-y-auto px-6 pb-6">
            <ReportDetailContent report={report} />
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
