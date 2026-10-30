import type {AnalysisStep, QueryResult} from '../services/apiClient'

export type AnalysisResult = {
    status: 'running' | 'success' | 'needs_clarification' | 'error';
    conclusion: string;
    steps: AnalysisStep[];
    results: QueryResult[];
    error: string;
}
