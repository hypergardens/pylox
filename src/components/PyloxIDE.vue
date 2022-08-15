<script>
import Pylox from '../Pylox'

export default {
  name: 'app',
  data() {
    return {
      code: 'a b c d e -1 @',
      consoleText: 'testConsole',
      stackText: 'testStack',
      pylox: new Pylox(),
    }
  },
  methods: {
    inputtedCode(e) {
      // this.$root.$emit('input', e.target.innerHTML)
      this.runCode()
    },
    runCode() {
      this.pylox = new Pylox()
      this.pylox.run(this.code)
      this.stackText = `[${this.pylox.interpreter.stack
        .slice()
        .reverse()
        .join(',')}`
      this.consoleText = `${this.pylox.consoleText}`
      // console.log(this.pylox.interpreter.stack)
    },
  },
  mounted: function () {
    this.code = basic
    // console.log(this.pylox.parse(this.code))
    this.runCode()
    // console.log(this.debugText)
    // this.$emit('input')
    // console.log('mounted')
  },
}

let minusTest = `-1 - 2 --3 - - 4 -2a - b`
let preBang = `!1 ! 2 !!3 ! ! 4 !a ! b !2c`
let postBang = `1! 2 ! 3!! ! 4 ! a! b ! 2c! `
let tildeTest = `2 2 ~ +`
let countTo10 = `
count:
dup print 1 + dup
10 >=
"noop" "count"
2 @ ? exec
count;

1 count`
let subProgTest = `0 a: 1 b: 2 b; 3 a; 4 a b`
let ack = `
// [m n
ack0:
1 del
1 +
ack0;

cex:
2 @ ? exec
cex;

// [top bot
ackMaster:
dup 0 ==
"ack1" "ack0"
2 @ ? exec
ackMaster;

ack1:
1 @ 
0 ==
"ack10" "ack11"
2 @ ? exec
ack1;

ack10:
noop
ack10;

ack11:
1 1 @ - 
ack11;

// bot top
    0   1 ackMaster`
let basic = `pi:
3.14
pi;
pi 2 *`
// [2,3,2,1,4,0

// let pylox = new Pylox()
// pylox.run(subProgTest)
// let tokens = pylox.tokens(`
// @ 4
// sq1:
// sq1;
// 1 2
// `);
// 1 2
//     : square;
// dup *
//     ; square

// let tokens = pylox.tokenise(source)
// let tree = pylox.parse(source)
// console.log(tokens)
// console.log(tree)
</script>
<template>
  <div class="wrapper">
    <div class="left-column deb code-text">
      <pre class="debug-output" v-for="output in pylox.interpreter.execOutput"
        >{{ output }}
      </pre>
    </div>

    <div class="right-column">
      <div class="content stack-view code-text center">
        {{ stackText }}
      </div>
      <textarea
        spellcheck="false"
        class="code-editing-area code-text center"
        v-model="code"
        @input.prevent="inputtedCode"
      ></textarea>
      <div class="footer console-view code-text center">
        <span class="">Console: {{ consoleText }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.center {
  margin-left: auto;
  margin-right: auto;
}
.deb {
  padding: 0px 30px;
  width: 600px;
}
.debug-output {
  line-height: 16px;
  padding: 0px;
  margin: 0px;
}
.code-text {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  font-family: monospace;
  padding: 10px;
  box-sizing: border-box;
}
.wrapper {
  display: flex;
}
.code-editing-area {
  width: 400px;
  height: 300px;
}

.stack-view {
  width: 300px;
  height: 60px;
  margin-bottom: 20px;
  word-wrap: break-word;
  background-color: #111;
}
.console-view {
  width: 300px;
  height: 300px;
}
</style>
