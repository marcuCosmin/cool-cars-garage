type DownloadBlobProps = {
  blob: Blob
  fileName: string
}

export const downloadBlob = ({ blob, fileName }: DownloadBlobProps) => {
  const url = URL.createObjectURL(blob)

  const linkElement = document.createElement("a")
  linkElement.href = url
  linkElement.download = fileName

  document.body.appendChild(linkElement)
  linkElement.click()
  linkElement.remove()

  setTimeout(() => URL.revokeObjectURL(url), 0)
}
