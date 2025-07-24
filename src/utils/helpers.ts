import { Control, BaselineLevel, ZeroTrustPillar, Observation } from '@/types';
import { createListCollection } from '@chakra-ui/react';

export const getControlsByPillar = (pillar: ZeroTrustPillar, currentControls: Control[]): Control[] => {
  return currentControls.filter(control => control.pillars.includes(pillar));
};

export const getControlsByBaseline = (baseline: BaselineLevel, currentControls: Control[]): Control[] => {
  return currentControls.filter(control => control.baseline === baseline);
};

export const getPassingPercentageByPillar = (pillar: ZeroTrustPillar, currentControls: Control[], applicable: boolean): number => {
  const applicableControls = !applicable?currentControls.filter(control => control.status !== 'not-applicable'):currentControls;
  const pillarControls = getControlsByPillar(pillar, applicableControls);
  if (pillarControls.length === 0) return 0;
  
  const passingControls = pillarControls.filter(control => control.status === 'passing');
  return (passingControls.length / pillarControls.length) * 100;
};

export const getListofTiedPillars = (val: number, currentControls: Control[], applicable: boolean): ZeroTrustPillar[] =>{
  var listofPillars:ZeroTrustPillar[] = [];
  const pillars = getPillars();
  const percentages = pillars.map(pillar => getPassingPercentageByPillar(pillar, currentControls, applicable));
  
  let indOfPillar:number = 0;
  for(const pillar of pillars){
    if(percentages[indOfPillar] == val){
      listofPillars.push(pillar);
    }
    indOfPillar = indOfPillar+1;
  }
  return listofPillars;
}

export const getPassingPercentageByBaseline = (baseline: BaselineLevel, currentControls: Control[], applicable: boolean): number => {
  const applicableControls = !applicable?currentControls.filter(control => control.status !== 'not-applicable'):currentControls;
  const baselineControls = getControlsByBaseline(baseline, applicableControls);
  if (baselineControls.length === 0) return 0;
  
  const passingControls = baselineControls.filter(control => control.status === 'passing');
  return (passingControls.length / baselineControls.length) * 100;
};

export const getPassingPercentageOverall = (currentControls: Control[], applicable: boolean): number => {
  const applicableControls = !applicable?currentControls.filter(control => control.status !== 'not-applicable'):currentControls;
  if (applicableControls.length === 0) return 0;
  
  const passingControls = applicableControls.filter(control => control.status === 'passing');
  return (passingControls.length / applicableControls.length) * 100;
};

export const getControlCountByBaseline = (currentControls: Control[], applicable: boolean): Record<BaselineLevel, number> => {
  const applicableControls = !applicable?currentControls.filter(control => control.status != 'not-applicable'):currentControls;
  return {
    high: applicableControls.filter(control => control.baseline === 'high').length,
    moderate: applicableControls.filter(control => control.baseline === 'moderate').length,
    low: applicableControls.filter(control => control.baseline === 'low').length,
    none: applicableControls.filter(control => control.baseline === 'none').length,
  };
};

export const getPillars = (): ZeroTrustPillar[] => {
  return [
    'User',
    'Device',
    'Network and Environment',
    'Application and Workload',
    'Data',
    'Visibility and Analytics',
    'Automation and Orchestration',
    'Other'
  ];
};

export const getBaselineLevels = (): BaselineLevel[] => {
  return ['high', 'moderate', 'low', 'none'];
};

export const baselineLevels_collection = createListCollection({
  items: [
    { label: "High", value: "high" },
    { label: "Moderate", value: "moderate" },
    { label: "Low", value: "low" },
    { label: "No Baseline", value: "none" }
  ]
})

export const getMaxPercentagePillar = (currentControls: Control[], applicable: boolean): number => {
  const pillars = getPillars();
  const percentages = pillars.map(pillar => getPassingPercentageByPillar(pillar, currentControls, applicable));

  if (!currentControls || currentControls.length === 0) {
    return 0;
  }
  let indofPillar = 0;
  let maxInd = 0;
  for (const pillar of pillars){
    if( percentages[indofPillar] > percentages[maxInd]){
      maxInd=indofPillar;
    }
    indofPillar=indofPillar+1;
  }
  return maxInd;
};

export const getMinPercentagePillar = (currentControls: Control[], applicable: boolean): number => {
  const pillars = getPillars();
  const percentages = pillars.map(pillar => getPassingPercentageByPillar(pillar, currentControls, applicable));

  if (!currentControls || currentControls.length === 0) {
    return 0;
  }
  let indofPillar = 0;
  let minInd = 0;
  for (const pillar of pillars){
    if( percentages[indofPillar] < percentages[minInd]){
      minInd=indofPillar;
    }
    indofPillar=indofPillar+1;
  }
  return minInd;
};

export const getPillarStats = (pillar: ZeroTrustPillar, controls: Control[], applicable: boolean) => {
  const relevantControls = !applicable?controls.filter( control => control.status !== 'not-applicable'):controls;
  const pillarControls = getControlsByPillar(pillar, relevantControls);
  if (pillarControls.length === 0){
    return [0, 0];
  }
  const passingControls = pillarControls.filter( control => control.status === 'passing');
  return [passingControls.length, pillarControls.length]
};


// returns [#passing controls per baseline, #applicable controls baseline]
export const getBaselineStats = (baseline: BaselineLevel, controls: Control[], applicable: boolean) => {
  const relevantControls = !applicable?controls.filter( control => control.status !== 'not-applicable'):controls;
  const baselineControls = getControlsByBaseline(baseline, relevantControls);
  if (baselineControls.length === 0){
    return [0, 0];
  }
  const passingControls = baselineControls.filter( control => control.status === 'passing');
  return [passingControls.length, baselineControls.length]
};

// get all observations in one place and count how many times they were referenced
// returns observation[] of all of them, and a map of their 
export const getAllObservations = (controls: Control[]) => {
  const uniqueObservations: Observation[] = [];
  const observationCounts = new Map<string, number>();
  const seenUuids = new Set<string>(); 

  for (const control of controls) {
    for (const obs of control.allObservations) {
      
      if (!seenUuids.has(obs.uuid)) {
        uniqueObservations.push(obs);
        seenUuids.add(obs.uuid);
      }

      const currentCount = observationCounts.get(obs.uuid) || 0;
      observationCounts.set(obs.uuid, currentCount + 1);
    }
  }
  return { uniqueObservations, observationCounts };
};

export const getTopFailingObservations = (controls: Control[], topCount: number = 3) => {
  const { uniqueObservations, observationCounts } = getAllObservations(controls);

  // Filter to only failing observations and create array with counts
  const failingObservations: Array<{ observation: Observation; failCount: number }> = [];

  for (const obs of uniqueObservations) {
    const result = obs.result.toLowerCase();

    if (result === "fail" || result === "notchecked") {
      const currentFails = observationCounts.get(obs.uuid) ?? 0;
      failingObservations.push({
        observation: obs,
        failCount: currentFails
      });
    }
  }

  // Sort by fail count in descending order and take top N
  const topFailingObservations = failingObservations
    .sort((a, b) => b.failCount - a.failCount)
    .slice(0, topCount);

  return topFailingObservations;
};

// Calculate potential compliance improvement for a pillar if top failing observations were fixed
export const getPotentialPassingPercentageByPillar = (pillar: ZeroTrustPillar, currentControls: Control[], applicable: boolean, topFailingObservations: Array<{ observation: Observation; failCount: number }>) => {
  const applicableControls = !applicable ? currentControls.filter(control => control.status !== 'not-applicable') : currentControls;
  const pillarControls = getControlsByPillar(pillar, applicableControls);
  
  if (pillarControls.length === 0) return 0;
  
  // Count current passing controls
  let potentialPassingControls = pillarControls.filter(control => control.status === 'passing').length;
  
  // Check failing controls to see if they could become passing
  const failingControls = pillarControls.filter(control => control.status === 'failing');
  const topFailingUuids = new Set(topFailingObservations.map(item => item.observation.uuid));
  
  failingControls.forEach(control => {
    // Check if this control has any of the top failing observations
    const hasTopFailingObs = control.allObservations.some(obs => 
      topFailingUuids.has(obs.uuid) && (obs.result.toLowerCase() === 'fail' || obs.result.toLowerCase() === 'notchecked')
    );
    
    if (hasTopFailingObs) {
      // Check if fixing the top failing observations would make this control pass
      const remainingFailingObs = control.allObservations.filter(obs => 
        !topFailingUuids.has(obs.uuid) && (obs.result.toLowerCase() === 'fail' || obs.result.toLowerCase() === 'notchecked')
      );
      
      // If no other failing observations remain, this control could become passing
      if (remainingFailingObs.length === 0) {
        potentialPassingControls++;
      }
    }
  });
  
  return (potentialPassingControls / pillarControls.length) * 100;
};

// Calculate potential compliance improvement for a baseline if top failing observations were fixed
export const getPotentialPassingPercentageByBaseline = (baseline: BaselineLevel, currentControls: Control[], applicable: boolean, topFailingObservations: Array<{ observation: Observation; failCount: number }>) => {
  const applicableControls = !applicable ? currentControls.filter(control => control.status !== 'not-applicable') : currentControls;
  const baselineControls = getControlsByBaseline(baseline, applicableControls);
  
  if (baselineControls.length === 0) return 0;
  
  // Count current passing controls
  let potentialPassingControls = baselineControls.filter(control => control.status === 'passing').length;
  
  // Check failing controls to see if they could become passing
  const failingControls = baselineControls.filter(control => control.status === 'failing');
  const topFailingUuids = new Set(topFailingObservations.map(item => item.observation.uuid));
  
  failingControls.forEach(control => {
    // Check if this control has any of the top failing observations
    const hasTopFailingObs = control.allObservations.some(obs => 
      topFailingUuids.has(obs.uuid) && (obs.result.toLowerCase() === 'fail' || obs.result.toLowerCase() === 'notchecked')
    );
    
    if (hasTopFailingObs) {
      // Check if fixing the top failing observations would make this control pass
      const remainingFailingObs = control.allObservations.filter(obs => 
        !topFailingUuids.has(obs.uuid) && (obs.result.toLowerCase() === 'fail' || obs.result.toLowerCase() === 'notchecked')
      );
      
      // If no other failing observations remain, this control could become passing
      if (remainingFailingObs.length === 0) {
        potentialPassingControls++;
      }
    }
  });
  
  return (potentialPassingControls / baselineControls.length) * 100;
};