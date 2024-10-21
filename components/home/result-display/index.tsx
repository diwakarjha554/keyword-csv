import React from 'react';
import { ProcessedResult } from '@/types/csv';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ResultDisplayProps {
    result: ProcessedResult;
    onDownload: () => void;
    isLoading: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onDownload, isLoading }) => {
    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Processing Result</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] rounded-md border p-4">
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-4 w-[300px]" />
                            <Skeleton className="h-4 w-[250px]" />
                        </div>
                    ) : (
                        <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                    )}
                </ScrollArea>
                <Button 
                    onClick={onDownload} 
                    className="mt-4"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        'Download JSON'
                    )}
                </Button>
            </CardContent>
        </Card>
    );
};

export default ResultDisplay;
