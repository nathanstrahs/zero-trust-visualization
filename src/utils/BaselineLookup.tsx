import { BaselineLevel } from "@/types";
import { convertFromDataKeyFormat } from "./map_pillars";


interface BaselineCategorizedControls {
  High: string[];     // Array of control IDs (e.g., "ac-1", "au-6.6")
  Moderate: string[]; // Array of control IDs
  Low: string[];      // Array of control IDs
}

const categorizedCongrolBaselines: BaselineCategorizedControls = {
  High: [
    "ac-2.11", 
    "ac-2.12",
    "au-10",
    "au-12.1",
    "ia-2.5",
    "si-4.20",
    "sc-12.1",
    "au-10",
    "sc-7.18",
    "sc-7.21",
    "au-12.3",
    "si-4.12",
    "ac-4.4",
    "ac-6.3",
    "ac-10",
    "ac-18.4",
    "ac-18.5",
    "au-5.1",
    "au-5.2",
    "au-9.2",
    "au-9.3",
    "ca-2.2",
    "ca-3.6",
    "ca-8",
    "ca-8.1",
    "cm-3.6",
    "cm-5.1",
    "cm-8.4",
    "cp-2.5",
    "cp-3.1",
    "cp-4.2",
    "cp-6.2",
    "cp-7.4",
    "cp-8.3",
    "cp-8.4",
    "cp-9.2",
    "cp-9.3",
    "cp-9.5",
    "cp-10.4",
    "ia-12.4",
    "ir-2.1",
    "ir-2.2",
    "ir-4.11",
    "ma-2.2",
    "ma-4.3",
    "ma-5.1",
    "mp-6.1",
    "mp-6.2",
    "mp-6.3",
    "pe-3.1",
    "pe-6.4",
    "pe-8.1",
    "pe-11.1",
    "pe-13.2",
    "pe-15.1",
    "pe-18",
    "ps-4.2",
    "ra-5.4",
    "sa-4.5",
    "sa-16",
    "sa-17",
    "sa-21",
    "sc-3",
    "sc-24",
    "si-4.14",
    "si-4.22",
    "si-5.1",
    "si-6",
    "si-7.2",
    "si-7.5",
    "si-7.15",
    "sr-9.1"
      ],

  Moderate: [
    "ac-2.2",
    "ac-2.3",
    "ac-2.4",
    "ac-6.9",
    "ac-6.10",
    "ac-12",
    "au-7",
    "au-7.1",
    "ia-5.2",
    "sc-23",
    "si-4.2",
    "si-4.4",
    "ac-17.1",
    "cm-7.2",
    "cm-7.5",
    "ia-3",
    "sc-17",
    "si-7",
    "ac-4",
    "ac-17.2",
    "sc-7.8",
    "sc-10",
    "si-10",
    "si-11",
    "sc-8",
    "sc-8.1",
    "sc-28",
    "sc-28.1",
    "sc-2",
    "sc-4",
    "sc-7.5",
    "au-3.1",
    "si-4.5",
    "ac-11",
    "ac-11.1",
    "ac-17.3",
    "ac-18.1",
    "ac-18.3",
    "ac-19.5",
    "ac-20.1",
    "ac-20.2",
    "at-2.3",
    "ca-2.1",
    "ca-7.1",
    "cm-2.3",
    "cm-2.7",
    "cm-3.4",
    "cm-7.1",
    "cm-8.1",
    "cm-12.1",
    "cp-2.1",
    "cp-2.3",
    "cp-2.8",
    "cp-4.1",
    "cp-6",
    "cp-6.1",
    "cp-6.3",
    "cp-7",
    "cp-7.1",
    "cp-7.2",
    "cp-7.3",
    "cp-8",
    "cp-8.1",
    "cp-8.2",
    "cp-9.1",
    "cp-9.8",
    "cp-10.2",
    "ia-12.2",
    "ia-12.3",
    "ia-12.5",
    "ir-3",
    "ir-3.2",
    "ir-6.3",
    "ir-7.1",
    "ma-3",
    "ma-3.1",
    "ma-3.2",
    "ma-3.3",
    "ma-6",
    "mp-3",
    "mp-4",
    "mp-5",
    "pe-4",
    "pe-5",
    "pe-6.1",
    "pe-9",
    "pe-10",
    "pe-11",
    "pe-13.1",
    "pe-17",
    "pl-8",
    "sa-4.1",
    "sa-4.2",
    "sa-4.9",
    "sa-9.2",
    "sa-15.3",
    "sc-7.3",
    "sc-7.7",
    "sc-18",
    "si-7.1",
    "si-8",
    "si-8.2",
    "si-16",
    "sr-6"
  ],
  Low: [
    "ac-3",
    "au-3",
    "au-8",
    "au-9",
    "au-12",
    "ia-2",
    "ia-2.1",
    "ia-2.2",
    "ia-2.12",
    "ia-5",
    "ia-5.1",
    "ia-8",
    "ia-8.1",
    "ia-8.2",
    "ia-8.4",
    "ia-11",
    "sc-12",
    "si-4",
    "cm-6",
    "sc-13",
    "si-3",
    "cm-7",
    "ia-6",
    "sr-3",
    "sc-7",
    "sc-39",
    "au-4",
    "au-5",
    "ac-7",
    "ac-8",
    "ac-18",
    "ac-20",
    "ac-22",
    "at-1",
    "at-2",
    "at-2.2",
    "at-3",
    "at-4",
    "au-1",
    "ca-1",
    "ca-3",
    "ca-7.4",
    "cm-1",
    "cm-5",
    "cp-1",
    "cp-3",
    "cp-4",
    "cp-9",
    "cp-10",
    "ia-2.8",
    "ia-7",
    "ir-1",
    "ir-2",
    "ir-7",
    "ma-1",
    "ma-2",
    "ma-4",
    "ma-5",
    "mp-1",
    "mp-2",
    "mp-6",
    "mp-7",
    "pe-1",
    "pe-2",
    "pe-3",
    "pe-6",
    "pe-8",
    "pe-12",
    "pe-13",
    "pe-14",
    "pe-15",
    "pe-16",
    "pl-1",
    "pl-2",
    "pl-4.1",
    "pl-10",
    "pl-11",
    "ps-1",
    "ps-2",
    "ps-3",
    "ps-6",
    "ps-7",
    "ps-8",
    "ps-9",
    "ra-1",
    "ra-2",
    "sa-1",
    "sa-2",
    "sa-3",
    "sa-4",
    "sa-4.10",
    "sa-5",
    "sa-8",
    "sa-9",
    "sa-22",
    "sc-1",
    "sc-5",
    "sc-15",
    "sc-20",
    "sc-21",
    "sc-22",
    "si-1",
    "si-12",
    "sr-1",
    "sr-2",
    "sr-2.1",
    "sr-5",
    "sr-8",
    "sr-11.1",
    "sr-11.2",
    "sr-12"
  ]
  
}


const highBaselineSet = new Set(categorizedCongrolBaselines.High);
const moderateBaselineSet = new Set(categorizedCongrolBaselines.Moderate);
const lowBaselineSet = new Set(categorizedCongrolBaselines.Low);

export function getBaselineForKey(dataKey: string): BaselineLevel {
  if (!dataKey) {
    return 'none';
  }
  var dataKeyLowercase = convertFromDataKeyFormat(dataKey);
  if(!dataKeyLowercase)  {
    return 'none';
  }
  if (highBaselineSet.has(dataKeyLowercase)) {
    return 'high';
  }
  if (moderateBaselineSet.has(dataKeyLowercase)) {
    return 'moderate';
  }
  if (lowBaselineSet.has(dataKeyLowercase)) {
    return 'low';
  }
  // If the key is not found in any of the categorized lists, it's 'No Baseline'.
  return 'none';
}
