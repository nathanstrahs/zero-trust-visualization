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

## 📖 Usage

Simply upload your assessment-results.json, and view the visualization tools.

---

## Understanding the Visualization

More extensive information can be found at [NIST SP 800-53 Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
### Summary:
* NIST components are mapped to 7 Department of Defense (DoD) pillars of security:
    * User
    * Device
    * Network and Enviornment
    * Application and Workload
    * Data
    * Visibility and Analytics
    * Automation and Orchestration
* If the component is unable to be mapped to any DoD pillar, it is placed in the 'other' catagory
* NIST components are also mapped to 4 different security baselines:
    * High
    * Moderate
    * Low
    * None

### Legend for components:
* ac - Access Control
* at - Awareness and Training
* au - Audit and Accountability
* ca - Assessment, Authorization and Monitoring
* cm - Configuration Management
* cp - Contingency Planning
* ia - Identification and Authentication
* ir - Incident Response
* ma - Maintenance
* mp - Media Protection
* pe - Physical and Environmental Protection
* pl - Planning
* pm - Program Management
* ps - Personnel Security
* pt - Personally Identifiable Information Processing and Transparency
* ra - Risk Assessment
* sa - System and Services Acquisition
* sc - System and Communications Protection
* si - System and Information Integrity
* sr - Supply Chain Risk Management

---

## License

Apache 2.0

---

## Contact

Your contact information or project maintainer(s).

* [Nathan Strahs] - [nstrahs@redhat.com]
* Project Link: [HOME](https://github.com/nathanstrahs/zero-trust-visualization)
