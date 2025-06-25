package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/antchfx/xmlquery"
	oscaltypes "github.com/defenseunicorns/go-oscal/src/types/oscal-1-1-3"
	"github.com/google/uuid"
)

// RuleInfo holds details extracted from an xccdf-1.2:Rule element
type RuleInfo struct {
	ID           string
	NISTControls []string
	Title        string // To capture the rule title for observations
	Description  string // To capture the rule description for observations
}

// RuleResultInfo holds details extracted from a rule-result element
type RuleResultInfo struct {
	IDRef       string
	Status      string // e.g., "pass", "fail", "notapplicable"
	Reason      string // From <reason> or inferred
	EvaluatedOn string // From rule-result/@time
}

const (
	oscalNamespace           = "https://oscal-compass.github.io/compliance-trestle/schemas/oscal"
	StatusStateSatisfied     = "satisfied"
	StatusStateNotSelected   = "notselected"
	StatusStateNotSatisfied  = "not-satisfied"
	StatusStateNotApplicable = "notapplicable"
	StatusStateNotAddressed  = "not-addressed"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Printf("Usage: %s <path/to/your/arf.xml>\n", os.Args[0])
		os.Exit(1)
	}

	arfFilePath := os.Args[1]
	outputFileName := "assessment-results-changed.json"

	file, err := os.Open(filepath.Clean(arfFilePath))
	if err != nil {
		fmt.Printf("Error reading ARF file %s: %v\n", arfFilePath, err)
		os.Exit(1)
	}
	defer file.Close()

	doc, err := xmlquery.Parse(bufio.NewReader(file))
	if err != nil {
		fmt.Printf("Error parsing XML: %v\n", err)
		os.Exit(1)
	}

	var hostname string
	targetEl := xmlquery.FindOne(doc, "//target")
	if targetEl != nil {
		hostname = strings.TrimSpace(targetEl.InnerText())
		fmt.Printf("Extracted hostname from ARF: %s\n", hostname)
	} else {
		fmt.Println("Warning: No 'target' element found in ARF XML. Hostname will be empty.")
		hostname = "unknown-host"
	}

	ruleDefinitions := make(map[string]RuleInfo)
	ruleResults := make(map[string]RuleResultInfo)

	// Pre-process Rule Definitions (to build our 'ruleTable' - ruleDefinitions)
	ruleElements := xmlquery.Find(doc, "//xccdf-1.2:Rule")
	for _, ruleEl := range ruleElements {
		ruleID := ruleEl.SelectAttr("id")
		if ruleID == "" {
			continue
		}

		var nistControls []string
		// FIX: Query for reference elements relative to the current rule element.
		nistRefElements := xmlquery.Find(ruleEl, "./xccdf-1.2:reference[starts-with(@href, 'http://nvlpubs.nist.gov/nistpubs/')]")
		for _, refEl := range nistRefElements {
			nistControls = append(nistControls, strings.TrimSpace(refEl.InnerText()))
		}

		titleEl := xmlquery.FindOne(ruleEl, "./xccdf-1.2:title")
		var ruleTitle string
		if titleEl != nil {
			ruleTitle = strings.TrimSpace(titleEl.InnerText())
		}

		descEl := xmlquery.FindOne(ruleEl, "./xccdf-1.2:description")
		var ruleDesc string
		if descEl != nil {
			ruleDesc = strings.TrimSpace(descEl.InnerText())
		}

		ruleDefinitions[ruleID] = RuleInfo{
			ID:           ruleID,
			NISTControls: nistControls,
			Title:        ruleTitle,
			Description:  ruleDesc,
		}
	}

	// Extract Rule Results
	results := xmlquery.Find(doc, "//rule-result")
	for _, resultEl := range results {
		idRef := resultEl.SelectAttr("idref")
		if idRef == "" {
			continue
		}

		statusEl := xmlquery.FindOne(resultEl, "./result")
		var status string
		if statusEl != nil {
			status = strings.TrimSpace(statusEl.InnerText())
		}

		reasonEl := xmlquery.FindOne(resultEl, "./reason")
		var reason string
		if reasonEl != nil {
			reason = strings.TrimSpace(reasonEl.InnerText())
		} else {
			reason = fmt.Sprintf("openscap rule-result is %s", status)
		}

		evaluatedOn := resultEl.SelectAttr("time")

		ruleResults[idRef] = RuleResultInfo{
			IDRef:       idRef,
			Status:      status,
			Reason:      reason,
			EvaluatedOn: evaluatedOn,
		}
	}

	// Generate OSCAL Assessment Results
	oscalAssessmentResultsModel := generateOscalAssessmentResults(ruleDefinitions, ruleResults, arfFilePath, hostname)

	// Wrap the AssessmentResults in the top-level OscalCompleteSchema as per the new types
	outputData := oscaltypes.OscalCompleteSchema{
		AssessmentResults: &oscalAssessmentResultsModel,
	}

	jsonData, err := json.MarshalIndent(outputData, "", "  ")
	if err != nil {
		fmt.Printf("Error marshalling OSCAL results to JSON: %v\n", err)
		os.Exit(1)
	}

	err = os.WriteFile(outputFileName, jsonData, 0644)
	if err != nil {
		fmt.Printf("Error writing OSCAL assessment-results.json: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Successfully generated %s from %s\n", outputFileName, arfFilePath)
}

// generateOscalAssessmentResults creates an OSCAL AssessmentResults object
func generateOscalAssessmentResults(ruleDefs map[string]RuleInfo, ruleRes map[string]RuleResultInfo, arfFilePath, hostname string) oscaltypes.AssessmentResults {
	startTime := time.Now()

	// Root of the OSCAL Assessment Results
	assessmentResults := oscaltypes.AssessmentResults{
		UUID: uuid.New().String(),
		Metadata: oscaltypes.Metadata{
			Title:        fmt.Sprintf("Assessment Results for %s from ARF File", hostname),
			Published:    &startTime,
			LastModified: startTime,
			Version:      "0.1.0",
			OscalVersion: "1.1.2", // Or "1.1.3" to match your package if desired
		},
		ImportAp: oscaltypes.ImportAp{
			Href: "file://complytime/assessment-plan.json",
		},
		Results: []oscaltypes.Result{},
	}

	// Create a single main Result
	mainResult := oscaltypes.Result{
		UUID:         uuid.New().String(),
		Title:        "OpenSCAP ARF Scan Automated Assessment", // Title is a required field
		Description:  "Assessment Results Automatically Generated from OpenSCAP ARF",
		Start:        startTime,
		End:          func() *time.Time { t := time.Now(); return &t }(),
		Findings:     &[]oscaltypes.Finding{},
		Observations: &[]oscaltypes.Observation{},
		ReviewedControls: oscaltypes.ReviewedControls{
			ControlSelections: []oscaltypes.AssessedControls{},
		},
	}

	observationUUIDsByRuleID := make(map[string]uuid.UUID)

	// First pass: Create Observations from rule results
	for ruleID, resultInfo := range ruleRes {
		ruleDef, found := ruleDefs[ruleID]
		if !found {
			fmt.Printf("Warning: Rule definition for ID '%s' not found, skipping observation creation.\n", ruleID)
			continue
		}

		obsUUID := uuid.New()
		observationUUIDsByRuleID[ruleID] = obsUUID

		var collectedTime time.Time
		t, err := time.Parse(time.RFC3339Nano, resultInfo.EvaluatedOn)
		if err != nil {
			t, err = time.Parse("2006-01-02T15:04:05-07:00", resultInfo.EvaluatedOn)
			if err != nil {
				collectedTime = startTime
				fmt.Printf("Warning: Could not parse evaluated-on time '%s' for rule %s. Using current time.\n", resultInfo.EvaluatedOn, ruleID)
			} else {
				collectedTime = t
			}
		} else {
			collectedTime = t
		}

		subjectUUID := uuid.New()

		subjectProps := []oscaltypes.Property{
			{Name: "resource-id", Ns: oscalNamespace, Value: ruleID},
			{Name: "result", Ns: oscalNamespace, Value: resultInfo.Status},
			{Name: "evaluated-on", Ns: oscalNamespace, Value: collectedTime.Format(time.RFC3339)},
			{Name: "reason", Ns: oscalNamespace, Value: resultInfo.Reason},
		}

		observationProps := []oscaltypes.Property{
			{Name: "assessment-rule-id", Ns: oscalNamespace, Value: ruleID},
		}

		observation := oscaltypes.Observation{
			UUID:        obsUUID.String(),
			Collected:   collectedTime,
			Title:       ruleDef.Title,
			Description: ruleDef.Description,
			Methods:     []string{"AUTOMATED"},
			Props:       &observationProps,
			RelevantEvidence: &[]oscaltypes.RelevantEvidence{
				{
					Description: "ARF_FILE",
					Href:        fmt.Sprintf("file://%s", arfFilePath),
				},
			},
			Subjects: &[]oscaltypes.SubjectReference{
				{
					SubjectUuid: subjectUUID.String(),
					Title:       hostname,
					Type:        "component",
					Props:       &subjectProps,
				},
			},
		}
		*mainResult.Observations = append(*mainResult.Observations, observation)
	}

	// Second pass: Create Findings and link to Observations
	findingsByNISTControl := make(map[string]oscaltypes.Finding)
	// Track all status values for each NIST control to determine final state
	controlStatusTracker := make(map[string][]string)

	for ruleID, ruleDef := range ruleDefs {
		resultInfo, hasResult := ruleRes[ruleID]
		if !hasResult || len(ruleDef.NISTControls) == 0 {
			continue
		}

		var relatedObsUUIDs []oscaltypes.RelatedObservation
		if obsUUID, ok := observationUUIDsByRuleID[ruleID]; ok {
			relatedObsUUIDs = append(relatedObsUUIDs, oscaltypes.RelatedObservation{ObservationUuid: obsUUID.String()})
		}

		decisionState := mapStatusToOscalDecision(resultInfo.Status)

		for _, nistControlID := range ruleDef.NISTControls {
			// Track all statuses for this control
			controlStatusTracker[nistControlID] = append(controlStatusTracker[nistControlID], decisionState)

			finding, exists := findingsByNISTControl[nistControlID]
			if !exists {
				// Initialize a new finding for this NIST control with default state
				finding = oscaltypes.Finding{
					UUID:        uuid.New().String(),
					Title:       fmt.Sprintf("Finding for Control %s", nistControlID),
					Description: fmt.Sprintf("Automated finding for control %s based on ARF scan results.", nistControlID),
					Target: oscaltypes.FindingTarget{
						TargetId: nistControlID,
						Type:     "statement-id",
						Status: oscaltypes.ObjectiveStatus{
							State: StatusStateNotAddressed, // Default state, will be updated below
						},
					},
					RelatedObservations: &[]oscaltypes.RelatedObservation{},
				}
			}

			// Aggregate related observations for this NIST control
			*finding.RelatedObservations = append(*finding.RelatedObservations, relatedObsUUIDs...)

			findingsByNISTControl[nistControlID] = finding
		}
	}

	// Final pass: Determine the correct status for each NIST control based on aggregated results
	for nistControlID, statuses := range controlStatusTracker {
		finding := findingsByNISTControl[nistControlID]

		hasFailure := false
		hasSatisfied := false
		hasNotApplicable := false
		hasNotSelected := false

		for _, status := range statuses {
			switch status {
			case StatusStateNotSatisfied:
				hasFailure = true
			case StatusStateSatisfied:
				hasSatisfied = true
			case StatusStateNotApplicable:
				hasNotApplicable = true
			case StatusStateNotSelected:
				hasNotSelected = true
			}
		}

		// Determine final state based on aggregated results
		var finalState string
		if hasFailure {
			// If any observation fails or is not tested, the control fails
			finalState = StatusStateNotSatisfied
		} else if (!hasSatisfied) && (hasNotApplicable || hasNotSelected) {
			// If all observations are not Applicable or not selected, then control is not-applicable
			finalState = StatusStateNotApplicable
		} else {
			// for any other reason, the state should be satisfied
			finalState = StatusStateSatisfied
		}

		finding.Target.Status.State = finalState
		findingsByNISTControl[nistControlID] = finding
	}

	// Add all unique findings to the main result
	for _, finding := range findingsByNISTControl {
		*mainResult.Findings = append(*mainResult.Findings, finding)
	}

	assessmentResults.Results = append(assessmentResults.Results, mainResult)

	return assessmentResults
}

// mapStatusToOscalDecision converts ARF result status to an OSCAL finding decision state.
func mapStatusToOscalDecision(status string) string {
	switch strings.ToLower(status) {
	case "pass":
		return StatusStateSatisfied
	case "fail":
		return StatusStateNotSatisfied
	case "error", "notchecked":
		return StatusStateNotSatisfied // Treat errors/notchecked as failures for compliance
	case "notapplicable":
		return StatusStateNotApplicable
	case "notselected":
		return StatusStateNotSelected
	default:
		return StatusStateNotAddressed // Default for unknown statuses, including not selected
	}
}
