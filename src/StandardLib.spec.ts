import Stox from './Stox'
describe('Binary operations library', () => {
  it('runs number addition', () => {
    expect(Stox.quickRun(`2 3 +`).debugAt(0).literal).toBe(5)
  })

  it('runs number and string addition', () => {
    expect(Stox.quickRun(`"apple" 3 +`).debugAt(0).literal).toBe('3apple')
  })

  it('runs string addition', () => {
    expect(Stox.quickRun(`"pie" "apple" +`).debugAt(0).literal).toBe('applepie')
  })

  it('runs number subtraction', () => {
    expect(Stox.quickRun(`6 10 -`).debugAt(0).literal).toBe(4)
  })

  it('throws on string subtraction', () => {
    expect(() => Stox.quickRun(`"cake" 10 -`)).toThrow()
    expect(() => Stox.quickRun(`"cake" "cake" -`)).toThrow()
    expect(() => Stox.quickRun(`"10 "cake" -`)).toThrow()
  })
  it('runs number multiplication', () => {
    expect(Stox.quickRun(`8 10 *`).debugAt(0).literal).toBe(80)
  })

  it('runs string multiplication', () => {
    expect(Stox.quickRun(`2 "walla" *`).debugAt(0).literal).toBe('wallawalla')
    expect(Stox.quickRun(`"walla" 2 *`).debugAt(0).literal).toBe('wallawalla')
  })

  it('runs number division', () => {
    expect(Stox.quickRun(`3 12 /`).debugAt(0).literal).toBe(4)
  })

  it('runs number modulo', () => {
    expect(Stox.quickRun(`3 13 %`).debugAt(0).literal).toBe(1)
  })

  it('combines operations well', () => {
    expect(Stox.quickRun(`10 20 / 3 + 1 - 10 *`).debugAt(0).literal).toBe(-40)
  })

  it('throws on invalid inputs', () => {
    expect(() => Stox.quickRun(`"walla" "walla" *`)).toThrow()
    expect(() => Stox.quickRun(`"cake" 10 /`)).toThrow()
    expect(() => Stox.quickRun(`"cake" 10 %`)).toThrow()
    expect(() => Stox.quickRun(`"cake" 10 -`)).toThrow()
  })
})
