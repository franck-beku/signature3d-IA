import { apiRequest } from './api'

export async function sendChatMessage(
  message: string,
  projectSlug: string,
  context?: string
): Promise<string> {
  const response = await apiRequest<{ response: string }>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, projectSlug, context }),
  })
  return response.response
}