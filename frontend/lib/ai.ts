import { chatApi } from './api'

export async function sendChatMessage(
  message: string,
  projectSlug: string,
  sessionToken?: string
): Promise<string> {
  const response = await chatApi.sendMessage(message, projectSlug, sessionToken)
  return response.response
}