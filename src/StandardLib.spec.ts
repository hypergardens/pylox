import Stox from './Stox'
describe('Comparisons library', () => {
  it('runs comparisons', () => {
    for (let termA = 0; termA <= 2; termA++) {
      for (let termB = 0; termB <= 2; termB++) {
        console.log(termA, termB, 'test')
        expect(Stox.quickRun(`${termB} ${termA} >`).debugAt(0).literal).toBe(
          termA > termB ? 1 : 0
        )
        expect(Stox.quickRun(`${termB} ${termA} <`).debugAt(0).literal).toBe(
          termA < termB ? 1 : 0
        )
        expect(Stox.quickRun(`${termB} ${termA} >=`).debugAt(0).literal).toBe(
          termA >= termB ? 1 : 0
        )
        expect(Stox.quickRun(`${termB} ${termA} <=`).debugAt(0).literal).toBe(
          termA <= termB ? 1 : 0
        )
        expect(Stox.quickRun(`${termB} ${termA} ==`).debugAt(0).literal).toBe(
          termA === termB ? 1 : 0
        )
        expect(Stox.quickRun(`${termB} ${termA} !=`).debugAt(0).literal).toBe(
          termA !== termB ? 1 : 0
        )
      }
    }
    // expect(Stox.quickRun(`10 11 >`).debugAt(0).literal).toBe(1)
    // expect(Stox.quickRun(`10 11 <`).debugAt(0).literal).toBe(0)
    // expect(Stox.quickRun(`11 11 >=`).debugAt(0).literal).toBe(1)
    // expect(Stox.quickRun(`9 11 >=`).debugAt(0).literal).toBe(1)
    // expect(Stox.quickRun(`10 11 <=`).debugAt(0).literal).toBe(0)
    // expect(Stox.quickRun(`10 11 <`).debugAt(0).literal).toBe(1)
  })
})

describe('Binary operations library', () => {
  it('runs number operations', () => {
    expect(Stox.quickRun(`2 3 +`).debugAt(0).literal).toBe(5)
    expect(Stox.quickRun(`6 10 -`).debugAt(0).literal).toBe(4)
    expect(Stox.quickRun(`8 10 *`).debugAt(0).literal).toBe(80)
    expect(Stox.quickRun(`3 12 /`).debugAt(0).literal).toBe(4)
    expect(Stox.quickRun(`3 13 %`).debugAt(0).literal).toBe(1)
  })

  it('runs number and string addition', () => {
    expect(Stox.quickRun(`"apple" 3 +`).debugAt(0).literal).toBe('3apple')
  })

  it('runs string addition', () => {
    expect(Stox.quickRun(`"pie" "apple" +`).debugAt(0).literal).toBe('applepie')
  })

  it('runs string multiplication', () => {
    expect(Stox.quickRun(`2 "walla" *`).debugAt(0).literal).toBe('wallawalla')
    expect(Stox.quickRun(`"salla" 2 *`).debugAt(0).literal).toBe('sallasalla')
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
