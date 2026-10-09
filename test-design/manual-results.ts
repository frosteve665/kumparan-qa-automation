/**
 * Manual / human-assisted executions (cases that cannot run unattended because
 * login is behind a Cloudflare human check). Filled in after each manual run.
 */
export interface ManualResult {
  status: 'PASS' | 'DEFECT' | 'BLOCKED' | 'NOT RUN';
  date: string;
  actual: string;
  evidence?: string;
}

export const MANUAL_RESULTS: Record<string, ManualResult> = {};
