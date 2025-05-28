export type BaselineLevel = 'high' | 'moderate' | 'low' | 'none';

export type ZeroTrustPillar = 
  | 'User' 
  | 'Device' 
  | 'Network and Environment'
  | 'Application and Workload'
  | 'Data'
  | 'Visibility and Analytics'
  | 'Automation and Orchestration'
  | 'other';

export interface Control {
  id: string;
  name: string;
  description: string;
  pillars: ZeroTrustPillar[];
  baseline: BaselineLevel;
  status: 'passing' | 'failing' | 'not-applicable';
}
