/**
 * Defines the structure for an OSCAL assessment-results document.
 * Simplified for the purpose of this task.
 */
interface OscalDocument {
  "assessment-results": AssessmentResults;
}

interface AssessmentResults {
  uuid: string;
  metadata: any; // Replace 'any' with a detailed interface if needed
  "import-ap": any; // Replace 'any' with a detailed interface if needed
  "local-definitions"?: LocalDefinitions;
  results: Result[];
}

interface LocalDefinitions {
  activities?: Activity[];
  // other local definitions can be added here
}

interface Activity {
  uuid: string;
  // ... other activity fields
  "related-controls"?: RelatedControlsContainer;
}

interface RelatedControlsContainer {
  "control-selections": ControlSelection[];
}

interface Result {
  uuid: string;
  title: string;
  description: string;
  start: string;
  end: string;
  "reviewed-controls"?: ReviewedControlsContainer;
  observations?: Observation[];
  risks?: Risk[];
  findings?: Finding[];
  // other result fields can be added here
}

interface ReviewedControlsContainer {
  "control-selections": ControlSelection[];
}

interface ControlSelection {
  "include-controls"?: ControlIdentifier[];
  "include-all"?: any; // Could be an object with properties
  "exclude-controls"?: ControlIdentifier[];
}

interface ControlIdentifier {
  "control-id": string;
}

interface Finding {
  uuid: string;
  title: string;
  description: string;
  target: Target;
  "related-observations"?: RelatedObservation[];
  // other finding fields
}

interface Target {
  "target-id": string; // e.g., "ac-6.1_obj"
  type: string; // e.g., "objective-id"
  status: Status;
  description?: string;
}

interface Status {
  state: string; // e.g., "not-satisfied", "satisfied", "open"
}

interface Observation {
  uuid: string;
  title: string;
  description: string;
  // other observation fields
}

interface Risk {
  uuid: string;
  title: string;
  // other risk fields
}

interface RelatedObservation {
    "observation-uuid": string;
}


/**
 * Represents the processed status of a single NIST control.
 */
export interface ControlTestResult {
  controlId: string;
  /**
   * 'pass': All related objectives were satisfied, or the control was reviewed with no findings indicating issues.
   * 'fail': One or more related objectives were 'not-satisfied'.
   * 'other': Related objectives have states like 'open' or 'investigating', and no 'fail' states.
   */
  status: 'pass' | 'fail' | 'other';
  /**
   * Titles or descriptions of findings related to this control.
   * Provides context, especially for 'fail' or 'other' statuses.
   */
  details: string[];
}

/**
 * Extracts NIST control statuses from an OSCAL assessment-results document.
 *
 * @param oscalDoc The OSCAL assessment-results JSON document.
 * @returns An array of ControlTestResult objects.
 */
export function extractNistControlStatuses(oscalDoc: OscalDocument): ControlTestResult[] {
  if (!oscalDoc || !oscalDoc["assessment-results"] || !oscalDoc["assessment-results"].results) {
    console.error("Invalid OSCAL assessment-results structure: Missing 'assessment-results' or 'results' array.");
    return [];
  }

  const assessmentResults = oscalDoc["assessment-results"];
  const allRelevantControlIds = new Set<string>();

  // 1. Identify all potentially tested controls
  // a. From "reviewed-controls" in each result
  assessmentResults.results.forEach(result => {
    result["reviewed-controls"]?.["control-selections"]?.forEach(selection => {
      selection["include-controls"]?.forEach(control => {
        allRelevantControlIds.add(control["control-id"]);
      });
    });
  });

  // b. From "findings" in each result (in case a finding exists for a control not explicitly in reviewed-controls)
  assessmentResults.results.forEach(result => {
    result.findings?.forEach(finding => {
      const targetId = finding.target["target-id"];
      // Regex to extract control ID part (e.g., "ac-6.1" from "ac-6.1_obj")
      // Adjust regex if control ID patterns are different. This handles common NIST patterns.
      const controlIdMatch = targetId.match(/^([a-zA-Z0-9().-]+)/);
      if (controlIdMatch && controlIdMatch[1]) {
        allRelevantControlIds.add(controlIdMatch[1]);
      } else {
        console.warn(`Could not parse control ID from finding target-id: ${targetId}`);
      }
    });
  });

  if (allRelevantControlIds.size === 0) {
    console.warn("No reviewed controls or findings with parsable control IDs found in the document.");
    return [];
  }

  // 2. Initialize control statuses
  // Default to 'pass'. This assumes a control is 'pass' if reviewed and no 'not-satisfied'
  // or 'other' state findings are present. 'fail' takes highest precedence, then 'other', then 'pass'.
  const controlStatusMap = new Map<string, { status: 'pass' | 'fail' | 'other', details: string[] }>();
  allRelevantControlIds.forEach(id => {
    controlStatusMap.set(id, { status: 'pass', details: [] });
  });

  // 3. Process findings to update statuses
  assessmentResults.results.forEach(result => {
    result.findings?.forEach(finding => {
      const targetId = finding.target["target-id"];
      const controlIdMatch = targetId.match(/^([a-zA-Z0-9().-]+)/);
      
      if (controlIdMatch && controlIdMatch[1]) {
        const controlIdFromFinding = controlIdMatch[1];
        if (controlStatusMap.has(controlIdFromFinding)) {
          const currentEntry = controlStatusMap.get(controlIdFromFinding)!;
          const findingState = finding.target.status.state.toLowerCase();
          const findingDetail = finding.title || finding.description || `Finding UUID: ${finding.uuid}`;
          
          if (!currentEntry.details.includes(findingDetail)) {
            currentEntry.details.push(findingDetail);
          }

          if (findingState === "not-satisfied") {
            currentEntry.status = 'fail'; // 'fail' has the highest precedence
          } else if (currentEntry.status !== 'fail') { // Only update if not already 'fail'
            if (findingState === "satisfied") {
              // If current status is 'pass', it remains 'pass'.
              // If current status is 'other', a 'satisfied' finding doesn't upgrade it to 'pass'
              // because 'other' implies an ongoing issue/state for another aspect of the control.
            } else { 
              // For other states like "open", "investigating", "not-applicable" etc.
              currentEntry.status = 'other'; // 'other' takes precedence over 'pass'
            }
          }
        }
        // If controlIdFromFinding is not in controlStatusMap, it means it was parsed from a finding
        // but wasn't in any reviewed-controls section AND failed the initial regex match for adding.
        // This scenario should be minimal if allRelevantControlIds captures all sources correctly.
      }
    });
  });

  // 4. Format the output
  const finalResults: ControlTestResult[] = [];
  controlStatusMap.forEach((value, key) => {
    finalResults.push({
      controlId: key,
      status: value.status,
      details: value.details,
    });
  });

  return finalResults;
}

// Example Usage (assuming you have the JSON data in a variable `oscalData`):
// const oscalData: OscalDocument = /* your JSON data here */;
// const controlStatuses = extractNistControlStatuses(oscalData);
// console.log(JSON.stringify(controlStatuses, null, 2));
