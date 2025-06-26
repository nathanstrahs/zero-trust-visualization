"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractNistControlStatuses = extractNistControlStatuses;

/**
 * Helper function to check for property existence and type
 * Throws an error if the check fails
 * @param {object} obj The object to check
 * @param {string} propName The name of the property
 * @param {string} expectedType The expected type (ex: 'object', 'array', 'string')
 * @param {string} pathString The string representing the path to the object containing the property.
 * @returns {any} The value of the property if valid
 */
function checkProperty(obj, propName, expectedType, pathString) {
    if (obj === null || typeof obj !== 'object') {
        throw new Error(`Cannot access property '${propName}' on a non-object at path leading to '${pathString}'.`);
    }
    if (!obj.hasOwnProperty(propName)) {
        throw new Error(`Missing property '${propName}' at path '${pathString}.${propName}'.`);
    }
    const value = obj[propName];
    if (expectedType === 'array') {
        if (!Array.isArray(value)) {
            throw new Error(`Property '${propName}' at path '${pathString}.${propName}' is not an array. Found type: ${typeof value}.`);
        }
    } else if (expectedType === 'object') {
        if (typeof value !== 'object' || value === null) {
            throw new Error(`Property '${propName}' at path '${pathString}.${propName}' is not an object. Found type: ${typeof value}.`);
        }
    } else if (typeof value !== expectedType) {
        // Handles all other types
        throw new Error(`Property '${propName}' at path '${pathString}.${propName}' is not of type '${expectedType}'. Found type: ${typeof value}.`);
    }
    return value;
}

/**
 * Validates the structure of an OSCAL assessment-results document
 * to ensure it contains all fields accessed by the oscalParser.js's
 * extractNistControlStatuses function. This helps prevent runtime errors
 * in the parser due to missing or malformed fields
 *
 * @param {object} oscalDoc The OSCAL assessment-results JSON document.
 * @throws {Error} If the document structure is invalid or missing required fields.
 */
function validateOscalDocumentStructure(oscalDoc) {
    if (!oscalDoc || typeof oscalDoc !== 'object') {
        throw new Error("OSCAL document is null, undefined, or not an object.");
    }

    // Check oscalDoc["assessment-results"]
    const assessmentResults = checkProperty(oscalDoc, "assessment-results", "object", "oscalDoc");

    // Check oscalDoc["assessment-results"].results
    const results = checkProperty(assessmentResults, "results", "array", "oscalDoc['assessment-results']");

    results.forEach((result, resultIndex) => {
        const resultPath = `oscalDoc['assessment-results'].results[${resultIndex}]`;
        if (typeof result !== 'object' || result === null) {
            throw new Error(`Item at ${resultPath} is not an object.`);
        }

        // Check result["reviewed-controls"] and its children (if "reviewed-controls" exists)
        // The parser uses optional chaining, so "reviewed-controls" itself is optional at the 'result' level.
        // If it is present, then its internal structure is validated.
        if (result.hasOwnProperty("reviewed-controls")) {
            const reviewedControls = checkProperty(result, "reviewed-controls", "object", resultPath);

            if (reviewedControls.hasOwnProperty("control-selections")) {
                const controlSelections = checkProperty(reviewedControls, "control-selections", "array", `${resultPath}['reviewed-controls']`);

                controlSelections.forEach((selection, selectionIndex) => {
                    const selectionPath = `${resultPath}['reviewed-controls']['control-selections'][${selectionIndex}]`;
                    if (typeof selection !== 'object' || selection === null) {
                        throw new Error(`Item at ${selectionPath} is not an object.`);
                    }

                    if (selection.hasOwnProperty("include-controls")) {
                        const includeControls = checkProperty(selection, "include-controls", "array", selectionPath);

                        includeControls.forEach((control, controlIndex) => {
                            const controlPath = `${selectionPath}['include-controls'][${controlIndex}]`;
                            if (typeof control !== 'object' || control === null) {
                                throw new Error(`Item at ${controlPath} is not an object.`);
                            }
                            // control["control-id"] is accessed directly by the parser if this path is taken.
                            checkProperty(control, "control-id", "string", controlPath);
                        });
                    }
                });
            }
        }

        // Check result.findings and its children (if "findings" exists)
        // The parser uses optional chaining for `result.findings`.
        // If "findings" is present, its elements are validated strictly for fields critical to the parser.
        if (result.hasOwnProperty("findings")) {
            const findings = checkProperty(result, "findings", "array", resultPath);

            findings.forEach((finding, findingIndex) => {
                const findingPath = `${resultPath}.findings[${findingIndex}]`;
                if (typeof finding !== 'object' || finding === null) {
                    throw new Error(`Item at ${findingPath} is not an object.`);
                }

                // finding.target is crucial.
                const target = checkProperty(finding, "target", "object", findingPath);
                
                //checks for uuid in a finding
                checkProperty(finding, "uuid", "string", findingPath);

                // finding.target["target-id"] is crucial (used for regex matching).
                checkProperty(target, "target-id", "string", `${findingPath}.target`);

                // finding.target.status is crucial.
                const findingStatus = checkProperty(target, "status", "object", `${findingPath}.target`);

                // finding.target.status.state is crucial and its type is important for '.toLowerCase()'.
                checkProperty(findingStatus, "state", "string", `${findingPath}.target.status`);



                // Optional but used fields for finding details: title, description
                // The parser is resilient to their absence or non-string types for the detail string,
                // but for data integrity and ensuring components "used" are of expected types if present:
                if (finding.hasOwnProperty("title")) {
                    checkProperty(finding, "title", "string", findingPath);
                }
                if (finding.hasOwnProperty("description")) {
                    checkProperty(finding, "description", "string", findingPath);
                }
                if (finding.hasOwnProperty("related-observations")){
                    checkProperty(finding, "related-observations", "array", findingPath);
                }
            });
        }
        if (result.hasOwnProperty("observations")) {
            const observations = checkProperty(result, "observations", "array", resultPath);

            observations.forEach((observation, observationIndex) => {
                const observationPath = `${resultPath}.observations[${observationIndex}]`;
                if (typeof observation !== 'object' || observation === null) {
                    throw new Error(`Item at ${observationPath} is not an object.`);
                }

                //checks to confirm observation can be searched by uuid later
                checkProperty(observation, "uuid", "string", observationPath);

                const subjects = checkProperty(observation, "subjects", "array", `${observationPath}`);

                subjects.forEach((subject, subjectIndex) => {
                    const subjectPath = `${observationPath}.subjects[${subjectIndex}]`
                    const props = checkProperty(subject, "props", "object", `${subjectPath}`);

                    props.forEach((prop, propIndex) => {
                        const propPath = `${observationPath}.subjects[0].props[${propIndex}]`;
                        if(typeof prop !== "object"){
                            throw new Error(`Item at ${propPath} is not an object.`)
                        }
                        //checks whether the observation has an object that could contain pass/fail result of observation
                        checkProperty(prop, "name", "string", propPath);
                        checkProperty(prop, "value", "string", propPath);

                    });
                });

                
            });
        }
    });
    // If all checks pass, the function completes execution, indicating a valid structure.
}


/**
 * Extracts NIST control statuses from an OSCAL assessment-results document.
 *
 * @param oscalDoc The OSCAL assessment-results JSON document.
 * @returns An array of ControlTestResult objects.
 */
function extractNistControlStatuses(oscalDoc) {
    try {
        validateOscalDocumentStructure(oscalDoc);
    } catch (error) {
        console.error("OSCAL document validation failed. Check if input file is a valid OSCAL results file: ", error.message);
        return [];
    }

    var assessmentResults = oscalDoc["assessment-results"];
    var allRelevantControlIds = new Set();

    const observationsMap = new Map();
    assessmentResults.results.forEach(result => {
        result.observations?.forEach(obs => {
            if (obs.uuid){
                observationsMap.set(obs.uuid, obs);
            }
        });
    });

    // Identify all potentially tested controls
    //      a. From "reviewed-controls" in each result
    assessmentResults.results.forEach(function (result) {
        var _a, _b;
        (_b = (_a = result["reviewed-controls"]) === null || _a === void 0 ? void 0 : _a["control-selections"]) === null || _b === void 0 ? void 0 : _b.forEach(function (selection) {
            var _a;
            (_a = selection["include-controls"]) === null || _a === void 0 ? void 0 : _a.forEach(function (control) {
                allRelevantControlIds.add(control["control-id"]);
            });
        });
    });
    //      b. From "findings" in each result (in case a finding exists for a control not explicitly in reviewed-controls)
    assessmentResults.results.forEach(function (result) {
        var _a;
        (_a = result.findings) === null || _a === void 0 ? void 0 : _a.forEach(function (finding) {
            var targetId = finding.target["target-id"];
            // Regex to extract control ID part (e.g., "ac-6.1" from "ac-6.1_obj")
            // Adjust regex if control ID patterns are different. This handles common NIST patterns
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
    //Initialize control statuses

    // DEFAULT TO 'PASS'. THIS ASSUMES A CONTROL IS 'PASS' IF REVIEWED AND NO 'NOT-SATISFIED'
    // OR 'OTHER' STATE FINDINGS ARE PRESENT. 'FAIL' TAKES HIGHEST PRECEDENCE, THEN 'OTHER', THEN 'PASS'
    var controlStatusMap = new Map();
    allRelevantControlIds.forEach(function (id) {
        controlStatusMap.set(id, { 
            status: 'pass', 
            details: [],
            passingObs: 0,
            totalObs: 0,
            proccessedObsUuids: new Set() 
        });
    });
    // Process findings to update statuses
    assessmentResults.results.forEach(function (result) {
        var _a;
        (_a = result.findings) === null || _a === void 0 ? void 0 : _a.forEach(function (finding) {
            var targetId = finding.target["target-id"];
            var controlIdMatch = targetId.match(/^([a-zA-Z0-9().-]+)/);
            if (controlIdMatch && controlIdMatch[1]) {
                var controlIdFromFinding = controlIdMatch[1];
                if (controlStatusMap.has(controlIdFromFinding)) {
                    var currentEntry = controlStatusMap.get(controlIdFromFinding);


                    if(finding.target.status.state){
                        var findingState = finding.target.status.state.toLowerCase();
                        var findingDetail = "Finding UUID: ".concat(finding.uuid);
                        if (!currentEntry.details.includes(findingDetail)) {
                            currentEntry.details.push(findingDetail);
                        }
                        if (findingState === "not-satisfied") {
                            currentEntry.status = 'fail'; // 'fail' has the highest precedence
                        }
                        else if (currentEntry.status !== 'fail') { // Only update if not already 'fail'
                            if (findingState === "satisfied") {
                                // If current status is 'pass', it remains 'pass'.
                                // anything other than pass will be other
                            }
                            else {
                                // For other states like "open", "investigating", "not-applicable" etc
                                currentEntry.status = 'other'; // 'other' takes precedence over 'pass'
                            }
                        }
                    }

                    finding["related-observations"]?.forEach(relObs => {
                        const obsUuid = relObs["observation-uuid"];

                        if (obsUuid && !currentEntry.proccessedObsUuids.has(obsUuid)){
                            currentEntry.proccessedObsUuids.add(obsUuid);
                            // retrieve the observation from the map created earlier
                            const observation = observationsMap.get(obsUuid);
                            if (observation) {

                                observation.subjects?.forEach(subject => {
                                    subject.props?.forEach(prop => {
                                        // if the observation passes, update the pass count
                                        if (prop.name === "result" && prop.value.toLowerCase() === "pass"){
                                            currentEntry.passingObs++;
                                        }
                                        // if observation is pass, fail, or notaddressed, update the total observation count
                                        if (prop.name === "result" && (prop.value.toLowerCase() === "pass" || prop.value.toLowerCase() === "fail" || prop.value.toLowerCase() === "notchecked")){
                                            currentEntry.totalObs++;
                                        }
                                    });
                                });
                            }
                        }
                    });
                }
            }
        });
    });
    // 4 format the output
    var finalResults = [];
    controlStatusMap.forEach(function (value, key) {
        finalResults.push({
            controlId: key,
            status: value.status,
            details: value.details,
            passingObs: value.passingObs,
            totalObs: value.totalObs
        });
    });
    return finalResults;
}
