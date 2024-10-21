'use client';

import { useState, useEffect } from 'react';
import FileUpload from './file-upload';
import ResultDisplay from './result-display';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ProcessedResult } from '@/types/csv';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, FileUp, RefreshCw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function Home() {
    const [csvData, setCsvData] = useState<string[][] | null>(null);
    const [csvFileName, setCsvFileName] = useState<string | null>(null);
    const [result, setResult] = useState<ProcessedResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [feedback, setFeedback] = useState<string>('');
    const { toast } = useToast();

    const CONSTANT_PROMPT = `You are an AI assistant tasked with analyzing a list of keywords to generate a final set of categories and corresponding tags. 

Your goal is to group keywords into common categories and create a consolidated list of tags under each category. Follow these instructions carefully to complete the task.

First, here is the list of keywords you will be working with:

<keyword_list>
{{KEYWORD_LIST}}
</keyword_list>

Your task is to identify common categories that represent these keywords, and within each category, assign relevant tags that best describe the keywords. 

The objective is to generate a final list of categories and corresponding tags based on the patterns and themes in the keyword set.

Follow these steps to complete the task:

1. Scan the Keyword List: Carefully review all the keywords provided. Identify common patterns, themes, and terms that appear frequently.

2. Generate Categories: Define the most appropriate categories to group the keywords. Some possible categories include:
   - Product Type
   - Feature
   - Target Audience
   - Intent
   - Benefit
   - Problem
   - Brand
   - Location
   - Time
   
You are not limited to these categories and should create additional ones as needed based on the keyword list.

It's better if you explore and find more categories.

5. Prepare the Output: Organize your final list of categories and tags in the following JSON format:

{
  "categories": [
    {
      "name": "Category Name",
      "tags": ["Tag1", "Tag2", "Tag3"]
    },
    {
      "name": "Another Category",
      "tags": ["TagA", "TagB", "TagC"]
    }
  ]
}

Additional guidelines:
- Ensure that tags are concise, clear, and relevant to their category.
- Avoid overly broad or vague tags that could apply to multiple categories.
- If you encounter branded terms, create a separate "Brand" category for them.
- For location-specific keywords, consider creating a "Location" category if there are enough relevant terms.

Remember, the goal is to create a useful, well-organized categorization that accurately represents the themes and patterns in the provided keyword list.`;

    useEffect(() => {
        const handleBeforeUnload = () => {
            localStorage.removeItem('csvData');
            localStorage.removeItem('csvFileName');
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            localStorage.removeItem('csvData');
            localStorage.removeItem('csvFileName');
        };
    }, []);

    const handleFileUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n').map((row) => row.split(',').map((cell) => cell.trim()));
            setCsvData(rows);
            setCsvFileName(file.name);
            toast({
                title: 'CSV Uploaded',
                description: `Your CSV file "${file.name}" has been successfully uploaded.`,
            });
        };
        reader.readAsText(file);
    };

    const handleProcessCsv = async () => {
        if (!csvData) {
            toast({
                title: 'No CSV Data',
                description: 'Please upload a CSV file first.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        setProgress(0);

        try {
            const keywordList = csvData.flat().filter((keyword) => keyword);
            const keywordString = keywordList.join('\n');
            let prompt = CONSTANT_PROMPT.replace('{{KEYWORD_LIST}}', keywordString);

            if (result && feedback) {
                prompt += `\n\nPrevious result: ${JSON.stringify(result)}\n\nUser feedback: ${feedback}\n\nPlease consider the previous result and the user's feedback when generating the new result.`;
            }

            console.log('Constructed Prompt:', prompt);

            const response = await fetch('/api/process-csv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });

            if (response.ok) {
                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                let accumulatedData = '';

                while (true) {
                    const { done, value } = await reader!.read();
                    if (done) break;
                    accumulatedData += decoder.decode(value, { stream: true });
                    setProgress((prevProgress) => Math.min(prevProgress + 10, 90));
                }

                const data = JSON.parse(accumulatedData);
                setResult(data);
                setProgress(100);
                toast({
                    title: 'Processing Complete',
                    description: 'Your CSV data has been processed successfully.',
                });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process CSV');
            }
        } catch (error: any) {
            console.error('Error processing CSV:', error);
            toast({
                title: 'Error',
                description: error.message || 'An error occurred while processing the CSV.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
            setFeedback('');
        }
    };

    const handleDownload = () => {
        if (!result) return;

        const jsonString = JSON.stringify(result, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'result.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: 'Download Started',
            description: 'Your JSON file is being downloaded.',
        });
    };

    return (
        <div className="w-full p-10">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Keyword App</CardTitle>
                    <CardDescription className="text-lg">Upload your CSV file and process it to generate categories and tags.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FileUpload onFileUpload={handleFileUpload} fileName={csvFileName} />
                    {csvData && (
                        <>
                            <Separator />
                            <div className="space-y-4">
                                {result && (
                                    <Textarea
                                        placeholder="Enter feedback for refining results..."
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                    />
                                )}
                                <Button 
                                    onClick={handleProcessCsv} 
                                    disabled={isLoading} 
                                    className="w-full"
                                    size="lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : result ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Process Again
                                        </>
                                    ) : (
                                        <>
                                            <FileUp className="mr-2 h-4 w-4" />
                                            Process CSV
                                        </>
                                    )}
                                </Button>
                                {isLoading && (
                                    <Progress 
                                        value={progress} 
                                        className="w-full"
                                    />
                                )}
                            </div>
                            {result && (
                                <>
                                    <Separator />
                                    <ResultDisplay result={result} onDownload={handleDownload} isLoading={isLoading} />
                                </>
                            )}
                        </>
                    )}
                </CardContent>
                <CardFooter>
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Tip</AlertTitle>
                        <AlertDescription>
                            Make sure your CSV file contains a list of keywords, one per row, for best results.
                        </AlertDescription>
                    </Alert>
                </CardFooter>
            </Card>
        </div>
    );
}
