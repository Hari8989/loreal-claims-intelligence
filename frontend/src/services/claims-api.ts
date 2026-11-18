import axios from 'axios';
import type { AssessClaimRequest, AssessmentResponse } from '../types/assessment';

const baseURL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
).replace(/\/+$/, '');

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120_000,
});

export async function assessClaim(
  payload: AssessClaimRequest,
): Promise<AssessmentResponse> {
  const { data } = await api.post<AssessmentResponse>(
    '/api/claims/assess',
    payload,
  );
  return data;
}

export function getAssessmentErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Something went wrong while assessing this claim. Please try again.';
  }

  if (!error.response) {
    return `Unable to reach the assessment service at ${baseURL}. Check that the backend is running and try again.`;
  }

  const status = error.response.status;
  const responseMessage = error.response.data?.message as
    | string
    | string[]
    | undefined;

  if (status === 400) {
    const details = Array.isArray(responseMessage)
      ? responseMessage.join(' ')
      : responseMessage;
    return details
      ? `Please review the submitted information. ${details}`
      : 'Please review the required fields and try again.';
  }

  if (status === 503) {
    return typeof responseMessage === 'string'
      ? responseMessage
      : 'The assessment service is temporarily unavailable. Please try again later.';
  }

  return 'The assessment could not be completed. Please try again later.';
}
