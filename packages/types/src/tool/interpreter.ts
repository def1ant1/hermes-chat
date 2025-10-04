import { PythonResult } from '@hermeslabs/python-interpreter';

export interface CodeInterpreterParams {
  code: string;
  packages: string[];
}

export interface CodeInterpreterFileItem {
  data?: File;
  fileId?: string;
  filename: string;
  previewUrl?: string;
}

export interface CodeInterpreterResponse extends PythonResult {
  files?: CodeInterpreterFileItem[];
}

export interface CodeInterpreterState {
  error?: any;
}
