# Uploading JSON results

## Minimum JSON Requirements

The application works by parsing a json file for required components. This section describes all the necessary components the JSON must have for the application to work.

For reference, an example [Simple_JSON](/docs/exampleUploads/EXAMPLE_SIMPLE_UPLOAD.json) provides an easy-to-visualize barebones results file, with all the necessary fields for the application to work. NOTE: the number of control-ids in the **include-controls** section of the reviewed-controls object does not have to be the same as the number of entries in the findings array. The application assumes the control has passed unless it is otherwise stated in the ``` assessment-results.results[i].findings[j].target.status.state``` corresponding to that control.

### JSON Visualization
![JSON Visualization](/docs/images/JSON_visual.png)

**NOTE**: Currently the only supported controls are NIST SP 800-53 Rev. 5 controls, mapped to NIST baselines

More examples of results.json files can be found [here](https://github.com/usnistgov/oscal-content/tree/main/examples/ar/json).
