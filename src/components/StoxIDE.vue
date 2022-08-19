<script>
import Stox from '../Stox'
import { Token } from '../Tokens'
import { StandardLibrary } from '../StandardLib'
import TokenViewVue from './TokenView.vue'
import TokenView from './TokenView.vue'
// import genetic from '../genetic'

export default {
  name: 'app',
  data() {
    return {
      code: 'a b c d e -1 @',
      consoleText: 'testConsole',
      stox: new Stox(),
    }
  },
  methods: {
    inputtedCode(e) {
      // this.$root.$emit('input', e.target.innerHTML)
      this.runCode()
    },
    runCode() {
      this.stox = new Stox()
      this.stox.run(this.code)
    },
  },
  mounted: function () {
    this.code = `count:
1 2 3
count;
0 count 4`
    this.runCode()
    // this.$emit('input')
  },
  computed: {
    stackText() {
      return `${this.stox.interpreter.stack.join(',') || ''}]`
    },
  },
  components: { TokenView },
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
    <div class="column deb code-text">
      <pre class="debug-output" v-for="operation in stox.interpreter.execOutput"
        >{{ operation }}
      </pre>
    </div>

    <div class="column">
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
        <span class="">Console: {{ this.stox.consoleText.join('\n') }}</span>
      </div>
    </div>
    <div class="column center">
      <div class="token-analysis">
        <TokenView
          :token="token"
          v-for="token of this.stox.interpreter.tokens"
          >{{ `${token.lexeme}_${token.type}` }}</TokenView
        >
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

.token-analysis {
  width: 400px;
  height: 300px;
  background-color: rgb(39, 39, 39);
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
