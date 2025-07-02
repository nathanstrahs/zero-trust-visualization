export type BaselineLevel = 'high' | 'moderate' | 'low' | 'none';

export type ZeroTrustPillar = 
  | 'User' 
  | 'Device' 
  | 'Network and Environment'
  | 'Application and Workload'
  | 'Data'
  | 'Visibility and Analytics'
  | 'Automation and Orchestration'
  | 'Other';

export interface Control {
  id: string;
  name: string;
  description: string;
  pillars: ZeroTrustPillar[];
  baseline: BaselineLevel;
  status: 'passing' | 'failing' | 'not-applicable';
  passingObs: number;
  totalObs: number;
  allObservations: Observation[];
}

export interface Observation {
  title: string;
  description: string;
  result: string;
  uuid: string;
}