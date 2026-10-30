export type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    result?: import('./analysis').AnalysisResult
}
