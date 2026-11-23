export interface ColumnMetadata {
  field: string;
  label: string;
  required: boolean;
  description: string;
  example: string;
  validValues?: string;
}

export interface ImportFieldRule extends ColumnMetadata {
  validation?: {
    type?: 'text' | 'date' | 'email' | 'boolean' | 'number' | 'enum';
    maxLength?: number;
    min?: number;
    max?: number;
    enumValues?: string[];
  };
}
