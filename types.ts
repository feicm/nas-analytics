export interface EventField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface EventDefinition {
  id: string;
  category: 'generic' | 'business' | 'system';
  trigger: string;
  extraFields: string[];
  samplingRate: string;
}

export interface Milestone {
  stage: string;
  date: string;
  completed: boolean;
}

export interface Metric {
  name: string;
  target: string;
  current?: string;
}
