import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Checkbox } from './components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

// Generic type for nested objects
type NestedObject = {
  [key: string]: string | number | boolean | NestedObject | NestedObject[] | null;
};

// Flattened data type
type FlattenedData = {
  [key: string]: string | number | boolean | null;
};

// Utility function to flatten nested JSON
const flattenJSON = (data: NestedObject | NestedObject[], prefix: string = ''): FlattenedData[] => {
  const flattenObject = (obj: NestedObject, currentPrefix: string = ''): FlattenedData => {
    const result: FlattenedData = {};

    const flatten = (currentObj: NestedObject, prefix: string = '') => {
      for (const [key, value] of Object.entries(currentObj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          flatten(value as NestedObject, newKey);
        } else {
          // Convert all values to string or null for consistent display
          result[newKey] = value === undefined ? null : 
            value === null ? null : 
            String(value);
        }
      }
    };

    flatten(obj, currentPrefix);
    return result;
  };

  // Handle both array and single object input
  const dataArray = Array.isArray(data) ? data : [data];
  return dataArray.map(item => flattenObject(item, prefix));
};

const JSONFlattener: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [flattenedData, setFlattenedData] = useState<FlattenedData[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const handleFlatten = () => {
    try {
      // Parse JSON input
      const parsedJson = JSON.parse(jsonInput) as NestedObject | NestedObject[];
      
      // Flatten the parsed JSON
      const flattened = flattenJSON(parsedJson);
      
      setFlattenedData(flattened);
      
      // Automatically select all fields initially
      const allFields = Object.keys(flattened[0] || {});
      setSelectedFields(allFields);
    } catch (error) {
      alert('Invalid JSON. Please check your input.');
      console.error(error);
    }
  };

  const toggleFieldSelection = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>JSON Flattener and Field Selector</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input 
              placeholder="Paste your JSON here"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="mb-2"
              multiline
              rows={6}
            />
            <Button onClick={handleFlatten} className="w-full">
              Flatten JSON
            </Button>
          </div>

          {flattenedData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Fields to Display:</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {Object.keys(flattenedData[0] || {}).map(field => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={selectedFields.includes(field)}
                      onCheckedChange={() => toggleFieldSelection(field)}
                    />
                    <label htmlFor={field} className="text-sm">{field}</label>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {selectedFields.map(field => (
                        <th key={field} className="border p-2 bg-gray-100">
                          {field}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {flattenedData.map((item, index) => (
                      <tr key={index}>
                        {selectedFields.map(field => (
                          <td key={field} className="border p-2">
                            {item[field] ?? 'N/A'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JSONFlattener;