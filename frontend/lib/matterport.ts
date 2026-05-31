export function getMatterportEmbedUrl(matterportId: string): string {
  return `https://my.matterport.com/show/?m=${matterportId}&play=1&qs=1`
}

export function getMatterportIdFromUrl(url: string): string | null {
  const match = url.match(/[?&]m=([^&]+)/)
  return match ? match[1] : null
}