export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  timestamp: Date;
  labels: Record<string, string>;
}

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary'
}

export interface MetricLabels {
  [key: string]: string;
}

export interface MetricValue {
  value: number;
  timestamp: Date;
}

export interface MetricData {
  name: string;
  type: MetricType;
  values: MetricValue[];
  labels: MetricLabels;
}

export interface MetricExport {
  metrics: MetricData[];
  timestamp: Date;
} 