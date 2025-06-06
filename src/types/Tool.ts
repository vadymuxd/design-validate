export interface Tool {
  name: string;
  description: string;
  logo: string;
  url: string;
}

export type Category = 'usability-testing' | 'event-tracking' | 'session-replay';