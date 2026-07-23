import { DTP } from '@ontomorph/dtp-sdk'

let dtpInstance: DTP | null = null

export function getDTP() {
  if (!dtpInstance) {
    const apiKey = process.env.EXPO_PUBLIC_DTP_API_KEY
    const holonApiKey = process.env.EXPO_PUBLIC_HOLON_API_KEY
    const holonApiUrl = process.env.EXPO_PUBLIC_HOLON_API_URL ?? 'https://holon.ontomorph.com'

    if (!apiKey) throw new Error('EXPO_PUBLIC_DTP_API_KEY is not set')
    if (!holonApiKey) throw new Error('EXPO_PUBLIC_HOLON_API_KEY is not set')

    dtpInstance = new DTP({
      apiKey,
      holonApiUrl,
      holonApiKey,
    })
  }
  return dtpInstance
}

export function connectSandboxTwin() {
  const grantToken = process.env.EXPO_PUBLIC_SANDBOX_GRANT_TOKEN
  if (!grantToken) throw new Error('EXPO_PUBLIC_SANDBOX_GRANT_TOKEN is not set')

  const dtp = getDTP()
  const twin = dtp.twins.connect(grantToken)
  const holon = dtp.holon
  return { twin, holon }
}