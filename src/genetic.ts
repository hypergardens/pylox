import { StandardLibrary } from './StandardLib'
import Stox from './Stox'
import dist from '@vitejs/plugin-vue'

export default null
let numbers = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
let letters = 'abcdefghijklmnopqrstuwxyz'
let ops = Object.keys(StandardLibrary)

class Script {
  source: (number | string | null)[]
  output: (number | string | null)[]
  size: number
  mut: (string | number)[][]
  mutChance: number
  score: number
  constructor() {
    this.source = []
    this.size = 4
    this.mut = [
      [4, 'number'],
      [2, 'char'],
      [2, 'word'],
      [0, 'labelStart'],
      [0, 'labelEnd'],
    ]
    this.mutChance = 0.01
    this.score = -1000
  }
  run() {
    let vm = new Stox(true)
    vm.run(this.source.join(' '))
    this.output = vm.interpreter.output()
    return this.output
  }
  randomToken() {
    let tokenType = weightedRandom(this.mut)
    let value: number | string = ''
    switch (tokenType) {
      case 'number':
        value = pick(numbers)
        this.source.push(value)
        break
      case 'char':
        value = `"${pick(letters)}"`
        this.source.push(value)
        break
      case 'word':
        do {
          value = pick(Object.keys(StandardLibrary))
        } while (value === 'push')
        this.source.push(value)
        break
      case 'labelStart':
        value = pick(letters) + ':'
        this.source.push(value)
        break
      case 'labelEnd':
        value = pick(letters) + ';'
        this.source.push(value)
        break

      default:
        console.error(`Incorrect token/mutation type ${tokenType}`)
    }
    return value
  }
  build() {
    if (this.source.length < this.size) {
      for (let i = this.source.length; i < this.size; i++) {
        this.source[i] = this.randomToken()
      }
    }
  }
}

function rand(n) {
  return Math.floor(Math.random() * n)
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function pick(arr) {
  return arr[rand(arr.length)]
}

function weightedRandom(options: (string | number)[][]) {
  let i
  let weights: number[] = []
  for (i = 0; i < options.length; i++)
    weights[i] = <number>options[i][0] + (weights[i - 1] || 0)
  let random = Math.random() * weights[weights.length - 1]
  for (i = 0; i < weights.length; i++) if (weights[i] > random) break
  return options[i][1]
}

function output(source: (string | number)[]) {}

function score(script: Script, targetStack: (string | number)[]) {
  // console.log(`RUNNING ${scripts[i].script.join(' ')}`)
  let total = 1000
  for (let i = 0; i < targetStack.length; i++) {
    if (script.output.length > i) {
      // has output for stack element
      let out = script.output[i]
      let target = targetStack[i]
      if (typeof target === 'number') {
        if (typeof out === 'string') {
          // number vs [string]
          total -= Math.abs(target)
        } else if (typeof out === 'number') {
          // number vs [number]
          total -= Math.abs(out - target) - 1
        }
      } else if (typeof target === 'string') {
        if (typeof out === 'string') {
          // string vs [string]
          for (let i = 0; i < target.length; i++) {
            if (out.length > i) {
              total -= Math.abs(out.charCodeAt(i) - target.charCodeAt(i))
            } else {
              total -= 10
            }
          }
        } else if (typeof out === 'number') {
          // string vs [number]
          total -= 30
        }
      }
    } else {
      // no output for stack element
      total -= 100
    }
  }
  return total
}

// build 100 random scripts
let scripts: Script[] = []
let populationMax = 60
let maxGenerations = 10000
let generationPrint = maxGenerations / 100
for (let i = 0; i < populationMax; i++) {
  scripts[i] = new Script()
  scripts[i].size = rand(30)
  scripts[i].build()
}

for (let generation = 0; generation < maxGenerations; generation++) {
  // score scripts
  for (let script of scripts) {
    script.run()
    try {
      let scriptScore = score(script, [11, 12, 13])
      script.score = scriptScore
    } catch (error) {}
  }

  // sort scripts
  scripts.sort((a, b) => b.score - a.score)

  if (generation % generationPrint === 0) {
    console.log(`         generation ${generation}/${maxGenerations}`)
    console.log(
      scripts
        .slice(0, 5)
        .map((s) => `${s.score} [${s.output}] {${s.source.join(' ')}}`)
        .join('\n')
    )
  }
  // view top 5

  // map to [score, script]
  // let scoreMap = scripts.map((s) => [s.score, s])
  // select parents through tournament
  let parents: Script[] = []
  let tournament: Script[]
  let parentsSelected = Math.floor(populationMax / 4)
  let prob = 0.5

  for (let i = 0; i < parentsSelected; i++) {
    tournament = []
    // select parents
    // TODO: probability of selection prob
    for (let i = 0; i < 2; i++) {
      let index = rand(scripts.length)
      let spliced = scripts.splice(index, 1)[0]
      tournament.push(spliced)
    }
    tournament.sort((a, b) => b.score - a.score)
    // let tournamentProbs = tournament.map((script, index) => [0, script])
    // console.log(tournamentProbs)
    parents.push(tournament[0])
  }
  scripts = []
  // create children and put them into scripts
  for (let i = 0; i < populationMax; i++) {
    // let parentAi = rand(parents.length)
    // let parentA = parents.splice(parentAi, 1)[0]
    // let parentBi = rand(parents.length)
    // let parentB = parents.splice(parentBi, 1)[0]
    let parentA = parents[rand(parents.length)]
    let parentB = parents[rand(parents.length)]
    let shorterParent = parentA.size >= parentB.size ? parentB : parentA
    let longerParent = parentA.size >= parentB.size ? parentA : parentB
    let child = new Script()
    // set child size to random number
    child.size = randInt(shorterParent.size, longerParent.size)
    // cross over parents
    for (let i = 0; i < shorterParent.size; i++) {
      if (Math.random() < 0.5) {
        child.source[i] = shorterParent.source[i]
      } else {
        child.source[i] = longerParent.source[i]
      }
    }
    for (let i = shorterParent.size; i < child.size; i++) {
      child.source[i] = longerParent.source[i]
    }

    // zap
    for (let i = 0; i < child.size; i++) {
      if (Math.random() < child.mutChance) {
        child.source[i] = child.randomToken()
      }
    }
    scripts.push(child)
  }
}
