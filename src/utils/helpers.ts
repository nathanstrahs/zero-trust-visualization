import { Control, BaselineLevel, ZeroTrustPillar } from '@/types';
//import { controls } from '@/data/controls';

export const getControlsByPillar = (pillar: ZeroTrustPillar, currentControls: Control[]): Control[] => {
  return currentControls.filter(control => control.pillar === pillar);
};

export const getControlsByBaseline = (baseline: BaselineLevel, currentControls: Control[]): Control[] => {
  return currentControls.filter(control => control.baseline === baseline);
};

export const getPassingPercentageByPillar = (pillar: ZeroTrustPillar, currentControls: Control[]): number => {
  const pillarControls = getControlsByPillar(pillar, currentControls);
  if (pillarControls.length === 0) return 0;
  
  const passingControls = pillarControls.filter(control => control.status === 'passing');
  return (passingControls.length / pillarControls.length) * 100;
};

export const getPassingPercentageByBaseline = (baseline: BaselineLevel, currentControls: Control[]): number => {
  const baselineControls = getControlsByBaseline(baseline, currentControls);
  if (baselineControls.length === 0) return 0;
  
  const passingControls = baselineControls.filter(control => control.status === 'passing');
  return (passingControls.length / baselineControls.length) * 100;
};

export const getPassingPercentageOverall = (currentControls: Control[]): number => {
  const applicableControls = currentControls.filter(control => control.status !== 'not-applicable');
  if (applicableControls.length === 0) return 0;
  
  const passingControls = applicableControls.filter(control => control.status === 'passing');
  return (passingControls.length / applicableControls.length) * 100;
};

export const getControlCountByBaseline = (currentControls: Control[]): Record<BaselineLevel, number> => {
  return {
    high: currentControls.filter(control => control.baseline === 'high').length,
    moderate: currentControls.filter(control => control.baseline === 'moderate').length,
    low: currentControls.filter(control => control.baseline === 'low').length,
    none: currentControls.filter(control => control.baseline === 'none').length,
  };
};

export const getPillars = (): ZeroTrustPillar[] => {
  return [
    'User',
    'Device',
    'Network/Environment',
    'Application and Workload',
    'Data',
    'Visibility and Analytics',
    'Automation and Orchestration'
  ];
};

export const getBaselineLevels = (): BaselineLevel[] => {
  return ['high', 'moderate', 'low', 'none'];
};
