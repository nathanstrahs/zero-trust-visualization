"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractNistControlStatuses = extractNistControlStatuses;
/**
 * Extracts NIST control statuses from an OSCAL assessment-results document.
 *
 * @param oscalDoc The OSCAL assessment-results JSON document.
 * @returns An array of ControlTestResult objects.
 */
function extractNistControlStatuses(oscalDoc) {
    if (!oscalDoc || !oscalDoc["assessment-results"] || !oscalDoc["assessment-results"].results) {
        console.error("Invalid OSCAL assessment-results structure: Missing 'assessment-results' or 'results' array.");
        return [];
    }
    var assessmentResults = oscalDoc["assessment-results"];
    var allRelevantControlIds = new Set();
    // 1. Identify all potentially tested controls
    // a. From "reviewed-controls" in each result
    assessmentResults.results.forEach(function (result) {
        var _a, _b;
        (_b = (_a = result["reviewed-controls"]) === null || _a === void 0 ? void 0 : _a["control-selections"]) === null || _b === void 0 ? void 0 : _b.forEach(function (selection) {
            var _a;
            (_a = selection["include-controls"]) === null || _a === void 0 ? void 0 : _a.forEach(function (control) {
                allRelevantControlIds.add(control["control-id"]);
            });
        });
    });
    // b. From "findings" in each result (in case a finding exists for a control not explicitly in reviewed-controls)
    assessmentResults.results.forEach(function (result) {
        var _a;
        (_a = result.findings) === null || _a === void 0 ? void 0 : _a.forEach(function (finding) {
            var targetId = finding.target["target-id"];
            // Regex to extract control ID part (e.g., "ac-6.1" from "ac-6.1_obj")
            // Adjust regex if control ID patterns are different. This handles common NIST patterns.
            var controlIdMatch = targetId.match(/^([a-zA-Z0-9().-]+)/);
            if (controlIdMatch && controlIdMatch[1]) {
                allRelevantControlIds.add(controlIdMatch[1]);
            }
            else {
                console.warn("Could not parse control ID from finding target-id: ".concat(targetId));
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
    var controlStatusMap = new Map();
    allRelevantControlIds.forEach(function (id) {
        controlStatusMap.set(id, { status: 'pass', details: [] });
    });
    // 3. Process findings to update statuses
    assessmentResults.results.forEach(function (result) {
        var _a;
        (_a = result.findings) === null || _a === void 0 ? void 0 : _a.forEach(function (finding) {
            var targetId = finding.target["target-id"];
            var controlIdMatch = targetId.match(/^([a-zA-Z0-9().-]+)/);
            if (controlIdMatch && controlIdMatch[1]) {
                var controlIdFromFinding = controlIdMatch[1];
                if (controlStatusMap.has(controlIdFromFinding)) {
                    var currentEntry = controlStatusMap.get(controlIdFromFinding);
                    var findingState = finding.target.status.state.toLowerCase();
                    var findingDetail = finding.title || finding.description || "Finding UUID: ".concat(finding.uuid);
                    if (!currentEntry.details.includes(findingDetail)) {
                        currentEntry.details.push(findingDetail);
                    }
                    if (findingState === "not-satisfied") {
                        currentEntry.status = 'fail'; // 'fail' has the highest precedence
                    }
                    else if (currentEntry.status !== 'fail') { // Only update if not already 'fail'
                        if (findingState === "satisfied") {
                            // If current status is 'pass', it remains 'pass'.
                            // If current status is 'other', a 'satisfied' finding doesn't upgrade it to 'pass'
                            // because 'other' implies an ongoing issue/state for another aspect of the control.
                        }
                        else {
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
    var finalResults = [];
    controlStatusMap.forEach(function (value, key) {
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
