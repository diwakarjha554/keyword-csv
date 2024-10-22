import Papa from 'papaparse';
import { ProcessedResult } from '@/types/csv';

export async function processCsvData(csvData: string, prompt: string): Promise<ProcessedResult> {
    return new Promise((resolve, reject) => {
        Papa.parse<Record<string, unknown>>(csvData, {
            header: true,
            complete: (results) => {
                // Here you would typically process the data based on the prompt
                // For this example, we'll just return a simple summary and the parsed data
                const summary = `Processed ${results.data.length} rows based on prompt: "${prompt}"`;

                resolve({
                    summary,
                    data: results.data,
                });
            },
            error: (error: Error) => {
                reject(error);
            },
        });
    });
}
