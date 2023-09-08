<template>
  <div id="app">
    <low-code :initCodeEntity="codeInfoEntity"></low-code>
  </div>
</template>

<script>
import LowCode from './components/LowCode/index'
const initCodeStr =
  '{"template":{"lc_id":"root","__children":[{"div":{"class":"container","style":"min-height: 100%; padding-bottom: 100px;","lc_id":"container","__text__":"Hello，欢迎使用LCG，请往此区域拖拽组件","__children":[{"div": {"__text__": "{{showText}}", "lc_id": "text"}},{"el-button":{"lc-mark":"","type":"danger","lc_id":"COAAYXizyI","__children":[],"__text__":"{{showValue}}","@click":"hello","size":"small"}}]}}]}}'

export default {
  name: 'App',
  components: {
    LowCode,
  },
  data() {
    return {
      codeInfoEntity: {
        codeStructure: JSON.parse(initCodeStr),
        JSCode: `
{
  data() {
    return { 
      showValue: "开启预览模式后,点击我显示预设逻辑", 
      showText: "这里的值声明于预设JS代码" 
    };
  },
  methods: {
    hello() {
      alert("来自预设逻辑代码的问候");
    },
  },
}`,
      },
    }
  },
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
}

html,
body {
  width: 100%;
  height: 100%;
}

#app {
  height: 100%;
}

*,
*::before,
*::after {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
html {
  font-family: sans-serif;
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  -ms-overflow-style: scrollbar;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
</style>
