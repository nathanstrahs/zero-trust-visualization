# Converter Instructions

## Purpose
This conversion tool is designed to accept output from the [oc-compliance](https://github.com/openshift/oc-compliance) operator plugin, and create an assessment-results.json file, written in OSCAL. The format of this file will be similar to an assessment-results.json file written by the [Complytime](https://github.com/complytime) project. An example output from this project can be found [here](https://github.com/nathanstrahs/zero-trust-visualization/blob/main/docs/exampleUploads/EXAMPLE_UPLOAD.json).

## Usage
Must have [go](https://go.dev/doc/install) installed.

Navigate to the go project directory for the conversion tool. This is necessary for the go packages to be used correctly.

```
$ cd go_extractor
$ go run arf2assessment-results.go /path/to/arf.xml assessment-results.json
```

The assessment 