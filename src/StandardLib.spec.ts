import Stox from './Stox'

describe('Basic functionality', () => {
  it('provides basic stack operations', () => {
    // noop
    expect(Stox.quickRun(`noop`).stack.length).toBe(0)
    // pull
    expect(Stox.quickRun(`"d" "c" "b" "a" 1 @`).debugAt(0).literal).toBe('b')
    // bad pull
    expect(() => Stox.quickRun(`1 @`)).toThrow()
    expect(() => Stox.quickRun(`1 "one" # 1 "one" # "one" @`)).toThrow()
    expect(() => Stox.quickRun(`1 "two" @`)).toThrow()
    expect(() => Stox.quickRun(`1 null @`)).toThrow()
    // label pull
    expect(Stox.quickRun(`1 "one" # 2 "one" @`).debugAt(0).literal).toBe(1)
    // labelling
    expect(Stox.quickRun(`1 "one" #`).debugAt(0).name).toBe('one')
    // delete
    expect(Stox.quickRun(`"c" "b" "a" 1 del`).debugAt(1).literal).toBe('c')
    // copy
    expect(Stox.quickRun(`"c" "b" "a" 1 copy`).debugAt(0).literal).toBe('b')
    // dup
    expect(Stox.quickRun(`5 dup`).debugAt(0).literal).toBe(5)
    expect(Stox.quickRun(`5 dup`).debugAt(1).literal).toBe(5)
    // put
    expect(Stox.quickRun(`"c" "b" "a" 1 put`).debugAt(1).literal).toBe('a')
  })
  it('prints to console', () => {
    const stox = new Stox()
    stox.run(`10 20 print print`)
    expect(stox.consoleText[0]).toBe('20')
    expect(stox.consoleText[1]).toBe('10')
    // this.vm.consoleText.push(msg)
  })
  it('correctly uses ?', () => {
    expect(Stox.quickRun(`"b" "a" 1 ?`).debugAt(0).literal).toBe('a')
    expect(Stox.quickRun(`"b" "a" 0 ?`).debugAt(0).literal).toBe('b')
    // this.vm.consoleText.push(msg)
  })
})

describe('Comparisons library', () => {
  it('runs comparisons', () => {
    for (let termA = 0; termA <= 2; termA++) {
      for (let termB = 0; termB <= 2; termB++) {
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
  })
})

describe('Logical library', () => {
  it('runs logical ops', () => {
    for (let termA = 0; termA <= 1; termA++) {
      // negation
      expect(Stox.quickRun(`${termA} !`).debugAt(0).literal).toBe(
        termA === 0 ? 1 : 0
      )
      for (let termB = 0; termB <= 1; termB++) {
        // or
        expect(Stox.quickRun(`${termB} ${termA} ||`).debugAt(0).literal).toBe(
          termA || termB ? 1 : 0
        )
        // and
        expect(Stox.quickRun(`${termB} ${termA} &&`).debugAt(0).literal).toBe(
          termA && termB ? 1 : 0
        )
      }
    }
  })
})

describe('Exec', () => {
  it('runs basic macros', () => {
    expect(Stox.quickRun(`pi: 3.14 pi; "pi" exec`).debugAt(0).literal).toBe(
      3.14
    )
  })
  it('runs nested macros', () => {
    expect(
      Stox.quickRun(`pi: 3.14 pi; \"\\\"pi\\\" exec" exec`).debugAt(0).literal
    ).toBe(3.14)
  })

  it('throws on invalid input', () => {
    expect(() => Stox.quickRun(`5 exec`)).toThrow()
    expect(() => Stox.quickRun(`null exec`)).toThrow()
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
    expect(Stox.quickRun(`"apple" null +`).debugAt(0).literal).toBe('nullapple')
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
    expect(() => Stox.quickRun(`5 null +`)).toThrow()
    expect(() => Stox.quickRun(`"walla" "walla" *`)).toThrow()
    expect(() => Stox.quickRun(`"cake" 10 /`)).toThrow()
    expect(() => Stox.quickRun(`"cake" 10 %`)).toThrow()
    expect(() => Stox.quickRun(`"cake" 10 -`)).toThrow()
  })
})
