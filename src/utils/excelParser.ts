import * as XLSX from 'xlsx';

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
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Skip header row and create map
    const controlsMap = new Map<string, ControlDetail>();
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (row.length >= 5 && row[0]) {
        const controlDetail: ControlDetail = {
          identifier: row[0]?.toString() || '',
          name: row[1]?.toString() || '',
          controlText: row[2]?.toString() || '',
          discussion: row[3]?.toString() || '',
          relatedControls: row[4]?.toString() || ''
        };
        
        controlsMap.set(controlDetail.identifier, controlDetail);
      }
    }
    
    controlsCache = controlsMap;
    return controlsMap;
  } catch (error) {
    console.error('Error loading controls from Excel:', error);
    return new Map();
  }
};

export const getControlDetail = async (controlId: string): Promise<ControlDetail | null> => {
  const controlsMap = await loadControlsFromExcel();
  return controlsMap.get(controlId) || null;
}; 