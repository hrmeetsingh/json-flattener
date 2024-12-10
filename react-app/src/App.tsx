import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import './App.css';

// Enhanced type definitions
type PrimitiveValue = string | number | boolean | null;
// type ComplexValue = Record<string, any> | any[];

interface FlattenedObject {
  [key: string]: {
    value: PrimitiveValue | PrimitiveValue[];
    type: 'primitive' | 'array';
  };
}

type JSONInput = Record<string, any> | Record<string, any>[];

const flattenObjectAdvanced = (obj: Record<string, any>, prefix: string = ''): FlattenedObject => {
  const flattened: FlattenedObject = {};

  const flatten = (value: any, currentPrefix: string) => {
    // Handle null and undefined
    if (value === null || value === undefined) {
      flattened[currentPrefix] = { value: null, type: 'primitive' };
      return;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) {
        flattened[currentPrefix] = { value: [], type: 'array' };
      } else {
        // If array contains primitives
        if (value.every(item => 
          typeof item === 'string' || 
          typeof item === 'number' || 
          typeof item === 'boolean' || 
          item === null
        )) {
          flattened[currentPrefix] = { 
            value: value as PrimitiveValue[], 
            type: 'array' 
          };
        } else {
          // If array contains objects or complex types
          value.forEach((item, index) => {
            const arrayPrefix = `${currentPrefix}[${index}]`;
            flatten(item, arrayPrefix);
          });
        }
      }
      return;
    }

    // Handle objects
    if (typeof value === 'object' && value !== null) {
      // Check if it's a non-array object
      if (Object.prototype.toString.call(value) === '[object Object]') {
        if (Object.keys(value).length === 0) {
          flattened[currentPrefix] = { value: null, type: 'primitive' };
        } else {
          Object.keys(value).forEach(key => {
            const newPrefix = currentPrefix 
              ? `${currentPrefix}.${key}` 
              : key;
            flatten(value[key], newPrefix);
          });
        }
      } else {
        // Handle other types of objects (Date, etc.)
        flattened[currentPrefix] = { 
          value: String(value), 
          type: 'primitive' 
        };
      }
    } else {
      // Handle primitive values
      flattened[currentPrefix] = { 
        value: value, 
        type: 'primitive' 
      };
    }
  };

  flatten(obj, prefix);
  return flattened;
};

const JSONFlattener: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [flattenedData, setFlattenedData] = useState<FlattenedObject[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const handleJsonParse = () => {
    try {
      const parsedJson: JSONInput = JSON.parse(jsonInput);
      const dataArray = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
      
      // Flatten each object in the array with advanced flattening
      const flattenedArray = dataArray.map(obj => flattenObjectAdvanced(obj));
      
      setFlattenedData(flattenedArray);
      
      // Automatically populate all possible fields
      const allFields = new Set<string>();
      flattenedArray.forEach(item => {
        Object.keys(item).forEach(field => allFields.add(field));
      });
      
      setSelectedFields(Array.from(allFields));
    } catch (error) {
      alert('Invalid JSON input');
    }
  };

  const toggleFieldSelection = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  // Memoize field list to optimize performance
  const allPossibleFields = useMemo(() => {
    return Array.from(new Set(flattenedData.flatMap(Object.keys)));
  }, [flattenedData]);

  const renderCellValue = (cellData: { value: PrimitiveValue | PrimitiveValue[], type: 'primitive' | 'array' }) => {
    if (cellData.type === 'primitive') {
      return cellData.value === null 
        ? <span className="text-gray-400">null</span>
        : String(cellData.value);
    }

    // Handle array type
    if (Array.isArray(cellData.value)) {
      return (
        <div className="flex flex-col">
          {cellData.value.map((item, index) => (
            <div key={index} className="border-b last:border-b-0 py-1">
              {item === null 
                ? <span className="text-gray-400">null</span>
                : String(item)}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Advanced JSON Flattener with Grouped Rendering</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input 
              placeholder="Paste your JSON here" 
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="mb-2"
            />
            <Button onClick={handleJsonParse}>Flatten JSON</Button>
          </div>

          {flattenedData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Fields to Display</h3>
              <ScrollArea className="h-48 w-full border rounded-md p-4">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {allPossibleFields.map(field => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={field}
                        checked={selectedFields.includes(field)}
                        onCheckedChange={() => toggleFieldSelection(field)}
                      />
                      <label htmlFor={field} className="truncate">{field}</label>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse border">
                  <thead>
                    <tr>
                      {selectedFields.map(field => (
                        <th key={field} className="border p-2 bg-gray-100">{field}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {flattenedData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {selectedFields.map(field => (
                          <td key={field} className="border p-2">
                            {item[field] 
                              ? renderCellValue(item[field])
                              : ''
                            }
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