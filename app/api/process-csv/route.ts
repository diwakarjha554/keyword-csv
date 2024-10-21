import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();

        // Log the received prompt length for debugging
        console.log('Received prompt length:', prompt.length);

        // Construct the messages for GPT
        const messages = [
            { role: 'system', content: 'You are a CSV data processor.' },
            { role: 'user', content: `${prompt}\n\nPlease respond with only valid JSON without any markdown formatting.` },
        ];

        // Process with GPT-4
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',  // Corrected model name
            messages: messages as OpenAI.Chat.ChatCompletionMessage[], // Type assertion
            temperature: 0, // Adjust creativity
        });

        let processedResult = completion.choices[0].message.content;

        // Remove markdown code blocks if present
        processedResult = (processedResult ?? '').replace(/```json\s*|\s*```/g, '').trim();

        // Parse the JSON result
        const jsonResult = JSON.parse(processedResult || '{}');

        // Return the processed result
        return NextResponse.json(jsonResult);
    } catch (error: any) {
        console.error('Error processing CSV:', error);

        // Provide more detailed error messages
        const errorMessage = error.response?.data || error.message || 'Failed to process CSV';

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}