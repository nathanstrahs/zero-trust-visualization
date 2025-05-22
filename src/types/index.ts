export type BaselineLevel = 'high' | 'moderate' | 'low' | 'none';

export type ZeroTrustPillar = 
  | 'User' 
  | 'Device' 
  | 'Network/Environment' 
  | 'Application and Workload'
  | 'Data'
  | 'Visibility and Analytics'
  | 'Automation and Orchestration';

export interface Control {
  id: string;
  name: string;
  description: string;
  pillar: ZeroTrustPillar;
  baseline: BaselineLevel;
  status: 'passing' | 'failing' | 'not-applicable';
}
