export type JobScript = {
  id: string
  run: () => Promise<void>
}
