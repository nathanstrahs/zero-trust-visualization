export type BaselineLevel = 'high' | 'moderate' | 'low' | 'none';

export type ZeroTrustPillar = 
  | 'User' 
  | 'Device' 
  | 'Network/Environment' 
  | 'Network & Environment'
  | 'Application and Workload'
  | 'Application & Workload'
  | 'Data'
  | 'Visibility and Analytics'
  | 'Visibility & Analytics'
  | 'Automation and Orchestration'
  | 'Automation & Orchestration'
  | 'Enabler'
  | 'other';

export interface Control {
  id: string;
  name: string;
  description: string;
  pillars: ZeroTrustPillar[];
  baseline: BaselineLevel;
  status: 'passing' | 'failing' | 'not-applicable';
}
