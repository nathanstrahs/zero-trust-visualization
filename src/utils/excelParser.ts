import * as ExcelJS from 'exceljs';

export interface ControlDetail {
  identifier: string;
  name: string;
  controlText: string;
  discussion: string;
  relatedControls: string;
}

let controlsCache: Map<string, ControlDetail> | null = null;

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
      if (values.length >= 5 && values[1]) {
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