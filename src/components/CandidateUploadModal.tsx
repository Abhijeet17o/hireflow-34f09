import { useState } from 'react';
import { X, Upload, Download, AlertCircle, ArrowRight } from 'lucide-react';
import { type CandidateUpload, type Stage } from '../types';

interface CandidateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (candidates: CandidateUpload[]) => void;
  stages: Stage[];
}

interface ColumnMapping {
  csvColumn: string;
  systemField: 'name' | 'email' | 'phone' | 'resumeUrl' | 'stage' | 'ignore';
}

interface ParsedData {
  headers: string[];
  rows: string[][];
  previewRows: string[][];
}

export function CandidateUploadModal({ isOpen, onClose, onUpload, stages }: CandidateUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [showMapping, setShowMapping] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadWarnings, setUploadWarnings] = useState<string[]>([]);
  const [showWarnings, setShowWarnings] = useState(false);

  if (!isOpen) return null;

  const systemFields = [
    { value: 'name', label: 'Full Name *', required: true },
    { value: 'email', label: 'Email Address *', required: true },
    { value: 'phone', label: 'Phone Number', required: false },
    { value: 'resumeUrl', label: 'Resume URL', required: false },
    { value: 'stage', label: 'Stage', required: false },
    { value: 'ignore', label: 'Ignore Column', required: false },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const csvFile = droppedFiles.find(file => 
      file.type === 'text/csv' || 
      file.name.endsWith('.csv') || 
      file.name.endsWith('.xlsx') || 
      file.name.endsWith('.xls')
    );
    
    if (csvFile) {
      setFile(csvFile);
      setError(null);
      parseFilePreview(csvFile);
    } else {
      setError('Please drop a CSV or Excel file');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      parseFilePreview(selectedFile);
    }
  };

  const parseFilePreview = async (file: File) => {
    try {
      const fileContent = await file.text();
      const lines = fileContent.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('File must contain at least a header row and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map(line => 
        line.split(',').map(cell => cell.trim().replace(/"/g, ''))
      );
      
      const previewRows = rows.slice(0, 3); // Show first 3 rows for preview
      
      setParsedData({ headers, rows, previewRows });
      
      // Auto-generate smart column mappings
      const smartMappings = generateSmartMappings(headers);
      setColumnMappings(smartMappings);
      setShowMapping(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    }
  };

  const generateSmartMappings = (headers: string[]): ColumnMapping[] => {
    return headers.map(header => {
      const lowerHeader = header.toLowerCase();
      
      let systemField: ColumnMapping['systemField'] = 'ignore';
      
      if (lowerHeader.includes('name') || lowerHeader.includes('full') || lowerHeader.includes('candidate')) {
        systemField = 'name';
      } else if (lowerHeader.includes('email') || lowerHeader.includes('mail')) {
        systemField = 'email';
      } else if (lowerHeader.includes('phone') || lowerHeader.includes('mobile') || lowerHeader.includes('contact')) {
        systemField = 'phone';
      } else if (lowerHeader.includes('resume') || lowerHeader.includes('cv') || lowerHeader.includes('url')) {
        systemField = 'resumeUrl';
      } else if (lowerHeader.includes('stage') || lowerHeader.includes('status') || lowerHeader.includes('level')) {
        systemField = 'stage';
      }
      
      return {
        csvColumn: header,
        systemField,
      };
    });
  };

  const updateColumnMapping = (index: number, systemField: ColumnMapping['systemField']) => {
    const updated = [...columnMappings];
    updated[index].systemField = systemField;
    setColumnMappings(updated);
  };

  const validateMappings = (): string | null => {
    const nameMapping = columnMappings.find(m => m.systemField === 'name');
    const emailMapping = columnMappings.find(m => m.systemField === 'email');
    
    if (!nameMapping) return 'Please map a column to "Full Name"';
    if (!emailMapping) return 'Please map a column to "Email Address"';
    
    return null;
  };

  const downloadTemplate = () => {
    const headers = ['Full Name', 'Email', 'Phone', 'Resume URL', 'Stage'];
    const sampleData = [
      'John Doe,john.doe@example.com,+91 9876543210,https://example.com/resume.pdf,Sourced',
      'Jane Smith,jane.smith@example.com,+91 8765432109,,Screening'
    ];
    
    const csvContent = [headers.join(','), ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'candidate_upload_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const processUploadWithMapping = async () => {
    if (!parsedData || !file) {
      setError('No file data available');
      return;
    }

    const validationError = validateMappings();
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const nameIndex = columnMappings.findIndex(m => m.systemField === 'name');
      const emailIndex = columnMappings.findIndex(m => m.systemField === 'email');
      const phoneIndex = columnMappings.findIndex(m => m.systemField === 'phone');
      const resumeIndex = columnMappings.findIndex(m => m.systemField === 'resumeUrl');
      const stageIndex = columnMappings.findIndex(m => m.systemField === 'stage');

      const candidates: CandidateUpload[] = [];
      const skippedRows: string[] = [];

      for (let i = 0; i < parsedData.rows.length; i++) {
        const row = parsedData.rows[i];
        const rowNumber = i + 2; // +2 because first row is header and arrays are 0-indexed
        
        // Check if row has enough columns for the mapped fields
        const requiredIndices = [nameIndex, emailIndex].filter(index => index >= 0);
        const maxRequiredIndex = Math.max(...requiredIndices);
        
        if (row.length <= maxRequiredIndex) {
          skippedRows.push(`Row ${rowNumber}: Insufficient columns (has ${row.length}, needs ${maxRequiredIndex + 1})`);
          continue;
        }

        // Safely extract data with proper fallbacks
        const name = nameIndex >= 0 && row[nameIndex] ? row[nameIndex].trim() : '';
        const email = emailIndex >= 0 && row[emailIndex] ? row[emailIndex].trim() : '';

        // Validate required fields
        if (!name) {
          skippedRows.push(`Row ${rowNumber}: Missing name`);
          continue;
        }
        
        if (!email) {
          skippedRows.push(`Row ${rowNumber}: Missing email`);
          continue;
        }
        
        // Validate email format
        if (!email.includes('@') || !email.includes('.')) {
          skippedRows.push(`Row ${rowNumber}: Invalid email format (${email})`);
          continue;
        }

        // Safely extract optional fields
        const phone = phoneIndex >= 0 && row[phoneIndex] ? row[phoneIndex].trim() : undefined;
        const resumeUrl = resumeIndex >= 0 && row[resumeIndex] ? row[resumeIndex].trim() : undefined;
        
        // Handle stage with proper fallback
        let stage = 'Sourced'; // Default stage
        if (stageIndex >= 0 && row[stageIndex]) {
          const providedStage = row[stageIndex].trim();
          // Check if the provided stage exists in the campaign stages
          const stageExists = stages.some(s => s.name.toLowerCase() === providedStage.toLowerCase());
          stage = stageExists ? providedStage : 'Sourced';
        }

        const candidate: CandidateUpload = {
          name,
          email,
          phone: phone || undefined,
          resumeUrl: resumeUrl || undefined,
          stage,
        };

        candidates.push(candidate);
      }

      // Show warning if some rows were skipped
      if (skippedRows.length > 0) {
        console.warn('Skipped rows during import:', skippedRows);
        setUploadWarnings(skippedRows);
        // Don't set showWarnings here - we'll show it after successful upload
      }

      if (candidates.length === 0) {
        const errorMessage = skippedRows.length > 0 
          ? `No valid candidates found. Issues found:\n${skippedRows.slice(0, 5).join('\n')}${skippedRows.length > 5 ? '\n...and more' : ''}`
          : 'No valid candidates found in the file. Please check the data and try again.';
        throw new Error(errorMessage);
      }

      await onUpload(candidates);
      
      // Show success message first
      const successMessage = `Successfully uploaded ${candidates.length} candidate${candidates.length === 1 ? '' : 's'}!`;
      
      // If successful but had warnings, show success then warnings popup
      if (skippedRows.length > 0) {
        alert(successMessage + ` However, ${skippedRows.length} row${skippedRows.length === 1 ? ' was' : 's were'} skipped due to data issues.`);
        setUploading(false);
        setShowMapping(false);
        setShowWarnings(true); // This will show the warnings popup
        return;
      }
      
      // Show success message and close if no warnings
      alert(successMessage);
      
      // Reset form only if no warnings
      setFile(null);
      setParsedData(null);
      setColumnMappings([]);
      setShowMapping(false);
      setError(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setParsedData(null);
    setColumnMappings([]);
    setShowMapping(false);
    setError(null);
    setUploadWarnings([]);
    setShowWarnings(false);
  };

  const handleWarningsClose = () => {
    setUploadWarnings([]);
    setShowWarnings(false);
    setFile(null);
    setParsedData(null);
    setColumnMappings([]);
    setShowMapping(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Upload Candidates</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {showWarnings ? (
            <>
              {/* Upload Success with Warnings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Upload Complete with Warnings</h3>
                  <button
                    onClick={resetUpload}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Upload Different File
                  </button>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">
                        Some rows were skipped
                      </h4>
                      <p className="text-sm text-yellow-700 mb-3">
                        {uploadWarnings.length} row{uploadWarnings.length > 1 ? 's were' : ' was'} skipped due to missing or invalid data. 
                        The valid candidates have been successfully imported.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Skipped Rows:</h4>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50">
                    {uploadWarnings.map((warning, index) => (
                      <div key={index} className="p-3 border-b border-gray-200 last:border-b-0">
                        <div className="text-sm text-gray-700 font-mono">{warning}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">Common Issues:</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Missing name:</strong> Name column is empty or not mapped correctly</li>
                    <li>• <strong>Missing email:</strong> Email column is empty or not mapped correctly</li>
                    <li>• <strong>Invalid email format:</strong> Email doesn't contain @ or . symbols</li>
                    <li>• <strong>Insufficient columns:</strong> Row has fewer columns than expected</li>
                  </ul>
                </div>
              </div>
            </>
          ) : !showMapping ? (
            <>
              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Upload Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Upload a CSV or Excel file with candidate information</li>
                  <li>• Our system will automatically detect column headers</li>
                  <li>• You can map your columns to our system fields</li>
                  <li>• Download the template below for reference</li>
                </ul>
              </div>

              {/* Template Download */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Download Template</h4>
                  <p className="text-sm text-gray-600">
                    Use this template to ensure your file is formatted correctly
                  </p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="btn-secondary inline-flex items-center"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV Template
                </button>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <label htmlFor="candidate-file" className="block text-sm font-medium text-gray-700">
                  Select File
                </label>
                
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="candidate-file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="candidate-file" className="cursor-pointer">
                    <Upload className={`mx-auto h-12 w-12 ${isDragOver ? 'text-primary-500' : 'text-gray-400'}`} />
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-900">
                        {file ? file.name : 'Choose a file or drag and drop'}
                      </p>
                      <p className="text-sm text-gray-600">
                        CSV, XLSX up to 10MB
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Column Mapping Interface */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Map Your Columns</h3>
                  <button
                    onClick={resetUpload}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Choose Different File
                  </button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-3">
                    We detected <strong>{parsedData?.headers.length}</strong> columns in your file. 
                    Please map them to our system fields below:
                  </p>
                  
                  {/* Mapping Status */}
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">Mapping Status:</h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        <span className="text-green-700">
                          Name: {columnMappings.find(m => m.systemField === 'name')?.csvColumn || 'Not mapped'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        <span className="text-green-700">
                          Email: {columnMappings.find(m => m.systemField === 'email')?.csvColumn || 'Not mapped'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${columnMappings.find(m => m.systemField === 'phone') ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
                        <span className="text-gray-600">
                          Phone: {columnMappings.find(m => m.systemField === 'phone')?.csvColumn || 'Will be empty'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${columnMappings.find(m => m.systemField === 'resumeUrl') ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
                        <span className="text-gray-600">
                          Resume: {columnMappings.find(m => m.systemField === 'resumeUrl')?.csvColumn || 'Will be empty'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${columnMappings.find(m => m.systemField === 'stage') ? 'bg-blue-500' : 'bg-yellow-500'}`}></span>
                        <span className="text-gray-600">
                          Stage: {columnMappings.find(m => m.systemField === 'stage')?.csvColumn || 'Will default to "Sourced"'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {columnMappings.map((mapping, index) => (
                      <div key={index} className="flex items-center space-x-4 bg-white p-3 rounded border">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">
                            {mapping.csvColumn}
                          </div>
                          <div className="text-xs text-gray-500">
                            Sample: {parsedData?.previewRows[0]?.[index] || 'No data'}
                          </div>
                        </div>
                        
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        
                        <div className="flex-1">
                          <select
                            value={mapping.systemField}
                            onChange={(e) => updateColumnMapping(index, e.target.value as ColumnMapping['systemField'])}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          >
                            {systemFields.map(field => (
                              <option key={field.value} value={field.value}>
                                {field.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Preview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Data Preview</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          {parsedData?.headers.map((header, index) => (
                            <th key={index} className="px-2 py-1 text-left font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData?.previewRows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-t border-gray-200">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-2 py-1 truncate max-w-32">
                                {cell ? (
                                  <span className="text-gray-900">{cell}</span>
                                ) : (
                                  <span className="text-gray-400 italic">empty</span>
                                )}
                              </td>
                            ))}
                            {/* Add empty cells if row is shorter than headers */}
                            {Array.from({ length: Math.max(0, (parsedData?.headers.length || 0) - row.length) }).map((_, emptyIndex) => (
                              <td key={`empty-${emptyIndex}`} className="px-2 py-1">
                                <span className="text-red-400 italic text-xs">missing</span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Showing first 3 rows. Total rows: {parsedData?.rows.length}
                  </p>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Stage Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Available Stages & Default Values</h4>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {stages.map((stage) => (
                  <span
                    key={stage.id}
                    className="px-2 py-1 text-xs font-medium bg-white border border-gray-200 rounded-full"
                  >
                    {stage.name}
                  </span>
                ))}
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• <strong>Missing Stage column:</strong> Candidates will be assigned to "Sourced"</p>
                <p>• <strong>Invalid stage values:</strong> Will default to "Sourced"</p>
                <p>• <strong>Missing Phone/Resume columns:</strong> Fields will be left empty</p>
                <p>• <strong>Missing Name/Email:</strong> Candidate will be skipped with warning</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          {showWarnings ? (
            <button
              onClick={handleWarningsClose}
              className="btn-primary"
            >
              Done
            </button>
          ) : showMapping ? (
            <button
              onClick={processUploadWithMapping}
              disabled={uploading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Processing...' : `Upload ${parsedData?.rows.length} Candidates`}
            </button>
          ) : (
            <button
              onClick={() => file && parseFilePreview(file)}
              disabled={!file}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Map Columns
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
