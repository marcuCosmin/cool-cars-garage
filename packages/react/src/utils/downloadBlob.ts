type DownloadBlobProps = {
  blob: Blob
  fileName: string
}

export const downloadBlob = ({ blob, fileName }: DownloadBlobProps) => {
  const url = URL.createObjectURL(blob)

  const linkElement = document.createElement("a")
  linkElement.href = url
  linkElement.download = fileName

  linkElement.click()

  URL.revokeObjectURL(url)
}
