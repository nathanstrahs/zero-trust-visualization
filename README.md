# OSCAL Zero Trust Visualization App

## Overview

This is a web application tool used to visualize the state and baseline of security of a model or cluster. It includes easy-to-understand visualization graphs and charts to assess the current passing/failing components from the NIST SP 800-53 Rev. 5 zero-trust framework. The application extracts information from a assessment-results.json file written in OSCAL. Examples of such a file can be found [here](https://github.com/usnistgov/oscal-content/tree/main/examples/ar/json).

More about OSCAL can be found [here](https://github.com/usnistgov/oscal-content/tree/main). More about NIST can be found [here](https://pages.nist.gov/OSCAL/learn/).

## TO BE IMPLEMENTED: 

This tool will be used in conjunction with [Complytime](https://github.com/complytime/complytime/) to automate the assessment process. This is not yet implemented, so manually uploading a assessment-results.json file is required.

---

## Features

* Visualizes Zero Trust architecture based on OSCAL data.
* Clearly indicates passing and failing OSCAL components.
* Provides extensive details for each component.
* User-friendly interface for navigating complex OSCAL data.

---

## Prerequisites (for both Mac and Linux)

* npm

---

## Installation & Setup

    git clone https://github.com/nathanstrahs/zero-trust-visualization.git
    cd zero-trust-visualization
    npm install

---

## Running the Application

How to start the application.

* **Development Mode:**
    * `npm run dev`

Access the application at `http://localhost:[your-port]`.

---

## Usage

Simply upload your assessment-results.json, and view the visualization tools.

---

## More Information
* For the application to successfully display controls, the uploaded JSON file must conform to the outline listed [here.](/docs/UPLOAD_INSTRUCTIONS.md)
* For more information about the NIST controls, refer to [this](/docs/NIST_INFO.md) document. 
* To see examples of uploaded assessment-results.json files, see this [examples directory](/docs/exampleUploads/).
---

## License

Apache 2.0

---

## Contact

Your contact information or project maintainer(s).

* [Nathan Strahs] - [nstrahs@redhat.com]
* Project Link: [HOME](https://github.com/nathanstrahs/zero-trust-visualization)
