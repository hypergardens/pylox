<script>
import Pylox from '../Pylox'
import { Token } from '../Tokens'
import { StandardLibrary } from '../StandardLib'
// import genetic from '../genetic'

export default {
  name: 'app',
  data() {
    return {
      code: 'a b c d e -1 @',
      consoleText: 'testConsole',
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
      // console.log(this.pylox.interpreter.stack)
      console.log(this.pylox.interpreter.output())
    },
  },
  mounted: function () {
    this.code = `
1 "one" #
2 "two" #
3 "three" #
10000
"one" @`
    // console.log(this.pylox.parse(this.code))
    this.runCode()
    // this.$emit('input')
  },
  computed: {
    stackText() {
      return `${this.pylox.interpreter.stack.join(',') || ''}]`
    },
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
let cexAmple = `cex:
2 @ ? exec
cex;
a: 5 4 a;

b: 6 b;

1 "b" "a"
cex
"done"`
let subProgTest = `0 a: 1 b: 2 b; 3 a; 4 a b`
let loopBuggy = `mul3:
dup 3 # // 0 == "ism3" #
mul3;

11 mul3`
let basic = `pi:
3.14
pi;
pi 2 *`
</script>
<template>
  <div class="wrapper">
    <div class="left-column deb code-text">
      <pre
        class="debug-output"
        v-for="operation in pylox.interpreter.execOutput"
        >{{ operation }}
      </pre>
    </div>

    <div class="right-column">
      <div class="content stack-view code-text center">
        <pre>{{ stackText }}</pre>
      </div>
      <textarea
        spellcheck="false"
        class="code-editing-area code-text center"
        v-model="code"
        @input.prevent="inputtedCode"
      ></textarea>
      <div class="footer console-view code-text center">
        <span class="">Console: {{ this.pylox.consoleText.join('\n') }}</span>
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
