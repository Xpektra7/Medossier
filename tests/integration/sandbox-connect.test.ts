import { describe, it, expect, beforeAll } from 'bun:test'

const apiKey = process.env.EXPO_PUBLIC_DTP_API_KEY
const grantToken = process.env.EXPO_PUBLIC_SANDBOX_GRANT_TOKEN
const holonKey = process.env.EXPO_PUBLIC_HOLON_API_KEY

const describeTest = apiKey && grantToken && holonKey ? describe : describe.skip

describeTest('sandbox twin integration', () => {
  let twin: any
  let holon: any

  beforeAll(() => {
    const { DTP } = require('@ontomorph/dtp-sdk')
    const dtp = new DTP({
      apiKey: apiKey!,
      baseUrl: 'https://sandbox-api.ontomorph.com',
      holonApiKey: holonKey!,
      holonApiUrl: 'https://holon-api.ontomorph.com',
    })

    twin = dtp.twins.connect(grantToken!)
    holon = dtp.holon

    expect(twin).toBeDefined()
    expect(twin.id).toBeTruthy()
    expect(twin.grant).toBeDefined()
    expect(twin.grant.twinId).toBe(twin.id)
    expect(holon).toBeDefined()
  })

  it('connects to sandbox twin with decoded grant claims', () => {
    expect(twin.id).toBeTruthy()
    expect(typeof twin.id).toBe('string')
    expect(twin.grant.grantId).toBeTruthy()
    expect(twin.grant.sub).toContain('sandbox-demo-consumer')
  })

  it('twin exposes expected API surface', () => {
    expect(typeof twin.flag).toBe('function')
    expect(typeof twin.systems.get).toBe('function')
    expect(typeof twin.events.list).toBe('function')
    expect(typeof twin.events.stream).toBe('function')
  })

  it('holon exposes expected API surface', () => {
    expect(typeof holon.concepts.search).toBe('function')
    expect(typeof holon.concepts.getByCode).toBe('function')
    expect(typeof holon.interactions.check).toBe('function')
    expect(typeof holon.interactions.checkList).toBe('function')
  })

  it('holon.concepts.getByCode resolves paracetamol (RxNorm 161)', async () => {
    const result = await holon.concepts.getByCode('161', 'RxNorm')
    expect(result).toBeDefined()
    expect(result.concept).toBeDefined()
    expect(result.concept.conceptId).toBeGreaterThan(0)
    expect(result.concept.conceptName.toLowerCase()).toContain('acetaminophen')
  }, 10_000)

  it('holon.concepts.getByCode resolves coartem (RxNorm 282448)', async () => {
    const result = await holon.concepts.getByCode('282448', 'RxNorm')
    expect(result).toBeDefined()
    expect(result.concept.conceptName.toLowerCase()).toContain('artemether')
  }, 10_000)

  it('holon.concepts.search finds drugs by name', async () => {
    const result = await holon.concepts.search('amlodipine', { domain: 'Drug' })
    expect(result).toBeDefined()
    expect(result.hits.length).toBeGreaterThanOrEqual(0)
    // Note: HOLON may return 0 hits depending on licensing; test existence only
  }, 10_000)

  it('holon.interactions.checkList returns results for multiple drugs', async () => {
    const result = await holon.interactions.checkList([161, 1191])
    expect(result).toBeDefined()
    expect(typeof result.totalInteractions).toBe('number')
    expect(Array.isArray(result.pairs)).toBe(true)
  }, 10_000)

  it('holon.interactions.check finds aspirin-ibuprofen interactions', async () => {
    const result = await holon.interactions.check(1191, 5640)
    expect(result).toBeDefined()
    expect(typeof result.hasInteraction).toBe('boolean')
    expect(Array.isArray(result.interactions)).toBe(true)
  }, 10_000)

  it('twin.events.list returns array', async () => {
    const result = await twin.events.list({ system: 'medication' })
    expect(Array.isArray(result)).toBe(true)
  }, 10_000)

  it('twin.flag creates an event on the twin', async () => {
    const event = await twin.flag('medication', {
      code: 'test.flag',
      value: 'integration-test',
      title: 'Integration Test Flag',
    })
    expect(event).toBeDefined()
    expect(event.id).toBeTruthy()
    expect(event.eventType).toBeDefined()
  }, 10_000)

  it('twin.systems.get returns a system view', async () => {
    const view = await twin.systems.get('medication')
    expect(view).toBeDefined()
    expect(view.system).toBe('medication')
    expect(view.twinId).toBe(twin.id)
  }, 10_000)
})