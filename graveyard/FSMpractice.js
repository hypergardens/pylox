class FSM {
  constructor() {
    this.start = 0;
    this.current = 0;
    this.source = "aacbz";
    this.state = "START";
  };
  load(code) {
    this.source = code;
  }
  read() {
    while (this.current < this.source.length) {
      this.input();
    }
  }
  makeWord() {
    this.current--;
    let word = this.source.slice(this.start, this.current);
    this.start = this.current;
    return word;
  }
  curr() {
    return this.source[this.current];
  }
  peek(n = 0) {
    if (this.current + n < 0) throw 'Looking backwards below 0';
    if (this.current + n >= this.source.length) return '\0';
    return this.source[this.current + n];
  }
  START(char) {
    if (char === "a" || char === "b") {
      // START, c
      this.state = "AB";
      this.AB(char);
    } else if (char === "c") {
      this.state = "C";
      this.C(char);
    } else if (char === "z") {
    }
  }
  AB(char) {
    // AB, a|b
    if (char === "a" || char === "b") {
    } else {
      // AB, c
      console.log(`word: ${this.makeWord()}`);
      this.state = "START";
    }
  }
  C(char) {
    // C, a|b
    if (char === "c") {
    } else {
      console.log(`word: ${this.makeWord()}`);
      this.state = "START";
      // C, c
    }
  }
  input() {
    let char = this.source[this.current];
    this.current += 1;
    console.log(`${char} -> ${this.state}`);
    this[this.state](char);
  }
}
new FSM().read();