export const TokenTypes = [
  `WORD`,
  `LABEL`,
  `STRING`,
  `NUMBER`,
  `NULL`,
  `WHITESPACE`,
  `NEWLINE`,
  `COMMENT`,
  `EOF`,
]

export class Token {
  static uid: number
  uid: number
  type: string
  xOff: number
  yOff: number
  lexeme: string
  literal: number | string | null
  name: string
  constructor(
    type: string,
    lexeme: string,
    literal: number | string | null,
    xOff: number | undefined,
    yOff: number | undefined
  ) {
    if (Token.uid === undefined) {
      Token.uid = 0
    } else {
      Token.uid++
    }
    this.uid = Token.uid

    this.type = type
    this.name = ''
    // check known type of token
    if (TokenTypes.indexOf(this.type) === -1) {
      throw `Unrecognised type: ${type}`
    }

    // actual string for the token
    this.lexeme = lexeme
    // only for NUMBER and STRING
    this.literal = literal

    if (xOff === undefined) throw `undefined pos ${lexeme}`
    if (yOff === undefined) throw `undefined pos ${lexeme}`
    this.xOff = xOff
    this.yOff = yOff
  }

  setName(name: string) {
    this.name = name
  }

  toString() {
    // VULN: confusion between literal and lexeme
    return `${this.literal ? this.literal : this.lexeme}${
      this.name !== '' ? '#' + this.name : ''
    }`
    // TODO: remember it's a terrible idea
    // return `${this.literal ? `V${this.literal}` : `L${this.lexeme}`}#${
    //   this.uid
    // }`
    // return `${this.type} ${this.lexeme}#${this.uid} ${this.literal} at ${this.yOff}`
  }
}

export function canVisitTokens(obj) {
  TokenTypes.forEach((type) => {
    if (!obj[`visit${type}token`])
      console.error(
        `Unimplemented token type in ${obj.constructor.name}.visit${type}token(): ${type}`
      )
  })
}
