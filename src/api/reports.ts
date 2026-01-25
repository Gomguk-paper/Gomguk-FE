import apiClient from '@/lib/apiClient';
import type { Report, GetReportsParams } from '@/lib/apiTypes';

export const reportsApi = {
    // Get all reports with optional filters
    getReports: async (params?: GetReportsParams): Promise<Report[]> => {
        const response = await apiClient.get<Report[]>('/reports', { params });
        return response.data;
    },

    // Get a single report by ID
    getReportById: async (id: string): Promise<Report> => {
        const response = await apiClient.get<Report>(`/reports/${id}`);
        return response.data;
    },
};
