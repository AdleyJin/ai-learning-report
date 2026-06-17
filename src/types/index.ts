export type ReportStatus = 'loading' | 'completed' | 'error';

export type AgentStepStatus = 'pending' | 'active' | 'done' | 'error';
export type AgentStepType =
  | 'search'
  | 'read'
  | 'terminal'
  | 'create'
  | 'run'
  | 'file'
  | 'check'
  | 'plan'
  | 'tools'
  | 'report';

export interface AgentStep {
  id: string;
  label: string;
  type?: AgentStepType;
  detail?: string;
  status: AgentStepStatus;
}

export interface ExecutionSummary {
  commandsRun?: number;
  filesRead?: number;
  filesCreated?: number;
}

export type FileFormat = 'html' | 'pdf' | 'word';

export interface ReportSubTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  /** 选中模版后填入对话框的默认文案 */
  defaultPrompt: string;
  /** 该模版下的子模版（用于在对话框上方弹出选择） */
  subTemplates: ReportSubTemplate[];
}

export interface StatCard {
  label: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  tooltip?: string;
}

export interface Report {
  id: string;
  title: string;
  status: ReportStatus;
  generatedAt?: string;
  formats: FileFormat[];
  stats?: StatCard[];
  analysisText?: string;
  errorMessage?: string;
}

export type MessageRole = 'user' | 'agent';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  isThinking?: boolean;
  animateContent?: boolean;
  agentSteps?: AgentStep[];
  executionSummary?: ExecutionSummary;
  reportSummary?: string;
  report?: Report;
}

export interface InputFormValues {
  prompt: string;
  templateId: string;
}
