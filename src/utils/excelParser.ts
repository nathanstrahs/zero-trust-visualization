import * as ExcelJS from 'exceljs';

export interface ControlDetail {
  identifier: string;
  name: string;
  controlText: string;
  discussion: string;
  relatedControls: string;
}

let controlsCache: Map<string, ControlDetail> | null = null;
let controlsCacheR4: Map<string, ControlDetail> | null = null;

export const loadControlsFromExcel = async (): Promise<Map<string, ControlDetail>> => {
  if (controlsCache) {
    return controlsCache;
  }

  try {
    // Fetch the Excel file from the public directory
    const response = await fetch('/sp800-53r5-control-catalog.xlsx');
    if (!response.ok) {
      throw new Error('Failed to fetch Excel file');
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    // Get the first sheet
    const worksheet = workbook.worksheets[0];

    // Create map
    const controlsMap = new Map<string, ControlDetail>();

    // Iterate over all rows that have values in the worksheet
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      // Skip header row
      if (rowNumber === 1) return;

      const values = row.values as string[];
      if (values.length >= 2 && values[1]) {
        const controlDetail: ControlDetail = {
          identifier: values[1] || '',
          name: values[2] || '',
          controlText: values[3] || '',
          discussion: values[4] || '',
          relatedControls: values[5] || ''
        };

        controlsMap.set(controlDetail.identifier, controlDetail);
      }
    });

    controlsCache = controlsMap;
    return controlsMap;
  } catch (error) {
    console.error('Error loading controls from Excel:', error);
    return new Map();
  }
};

export const getControlDetail = async (controlId: string): Promise<ControlDetail | null> => {
  const controlsMap = await loadControlsFromExcel();

  const suffixToRemove = /\([a-zA-Z]\)$/;
  const lookupID = controlId.replace(suffixToRemove, '');
  return controlsMap.get(lookupID) || null;
};

export const loadControlsFromExcelr4 = async (): Promise<Map<string, ControlDetail>> => {
  if (controlsCacheR4) {
    return controlsCacheR4;
  }

  try {
    const response = await fetch('/800-53-rev4-controls.xlsx');
    if (!response.ok) {
      throw new Error('Failed to fetch Rev. 4 Excel file');
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    // first sheet
    const worksheet = workbook.worksheets[0];
    // create map
    const controlsMap = new Map<string, ControlDetail>();

    let currentControl: ControlDetail | null = null;
    let currentIdentifier = '';
    const prefix = /^([A-Z]{2}-\d+(?:\(\d+\))?)/;

    // Iterate over all rows in the worksheet
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      // Skip header row
      if (rowNumber === 1) return;

      // trim to follow convention
      const controlIdentifier = row.getCell(2).value?.toString().trim() || '';

      const match = controlIdentifier.match(prefix);
      currentIdentifier = match? match[1] : '';

      const controlTitle = row.getCell(3).value?.toString().trim() || '';
      const descriptionText = row.getCell(6).value?.toString().trim() || '';
      const supplementalGuidance = row.getCell(7).value?.toString().trim() || '';
      const relatedControls = row.getCell(8).value?.toString().trim() || '';

      // A new control starts when there is a value in the 'NAME' column (B) and title column
      if (controlIdentifier && controlTitle) {
        currentControl = {
          identifier: currentIdentifier,
          name: controlTitle,
          controlText: descriptionText,
          discussion: supplementalGuidance,
          relatedControls: relatedControls
        };

        // If there's a control being built, save it to the map before starting a new one
        controlsMap.set(currentIdentifier, currentControl);
        
      } else if (currentControl && (!controlTitle) && (descriptionText || supplementalGuidance || relatedControls)) {
        // This is a continuation row for the current control 
        currentControl.controlText += `\n${descriptionText}`;
        currentControl.discussion += `\n${supplementalGuidance}`;
        currentControl.relatedControls += `\n${relatedControls}`;
      }

    });
    
    controlsCacheR4 = controlsMap;
    return controlsMap;
  } catch (error) {
    console.error('Error loading Rev. 4 controls from Excel:', error);
    return new Map();
  }
};

export const getControlDetailr4 = async (controlId: string): Promise<ControlDetail | null> => {
  const controlsMap = await loadControlsFromExcelr4();

  const suffixToRemove = /\([a-zA-Z]\)$/;
  const lookupID = controlId.replace(suffixToRemove, '');
  return controlsMap.get(lookupID) || null;
}