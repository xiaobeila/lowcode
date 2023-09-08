<template>
  <div class="darkmode-container">
    <nav class="base-component-container">
      <raw-components></raw-components>
    </nav>
    <div class="main-container">
      <div class="preview-container">
        <div id="render-control-panel">
          <!--这里不能放任何东西，执行时会被清空-->
        </div>
      </div>
      <attribute-input
        :enableRemoveButton="true"
        class="attribute"
        @save="onSaveAttr"
        @remove="onRemove"
        ref="attributeInput"
        shortcutInitMode="hand"
        :__rawVueInfo__="currentEditRawInfo"
      >
      </attribute-input>
    </div>

    <!-- 辅助定位线 -->
    <div class="cross-flag">
      <div class="x"></div>
    </div>
  </div>
</template>

<script>
import RawComponents from './RawComponents'
import AttributeInput from './AttributeInput'
// // 这个文件不可以进行懒加载，它会导致运行时不可点击的行为，具体原因未知
import { MainPanelProvider } from '@/utils/libs/main-panel'

import { splitInit } from '@/utils/libs/split-init'
import { initContainerForLine } from '@/utils/lineHelper'

export default {
  name: 'LowCode',
  props: {
    initCodeEntity: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      currentEditRawInfo: '',
      JSCode: '',
    }
  },
  watch: {
    currentEditRawInfo(newValue) {
      const attributeContainter = document.querySelector('.attribute')
      if (newValue) {
        attributeContainter.style = 'right:10px; display:block;'
        this.$refs['attributeInput'].onShow()
      } else {
        attributeContainter.style = 'right: calc(-300px - 20px); display:none;'
        this.$refs['attributeInput'].onHide()
      }
    },
    initCodeEntity(newVal) {
      if (newVal.JSCode) {
        this.mainPanelProvider.saveJSCodeOnly(this.convertLogicCode(newVal.JSCode))
      }

      if (newVal.codeStructure) {
        this.mainPanelProvider.render(newVal.codeStructure)
      }
    },
  },
  components: {
    RawComponents,
    AttributeInput,
  },
  mounted() {
    Promise.all([import('@/map/load')]).then(() => {
      this.$emit('onLoadFinish')
      this.init()
    })
    splitInit()
  },
  created() {
    this.mainPanelProvider = new MainPanelProvider()
  },
  methods: {
    convertLogicCode(JSCode) {
      try {
        const JSCodeInfo = eval(`(function(){return ${JSCode.replace(/\s+/g, '')}})()`)
        // 保留JS代码
        this.JSCode = JSCode
        if (this.$refs.codeEditor) {
          this.$refs.codeEditor.updateLogicCode(JSCode)
        }
        return JSCodeInfo
      } catch (e) {
        console.warn(`外部逻辑代码解析出错，解析的逻辑代码为: ${JSCode}, Error: ${e}`)
      }
    },
    init() {
      // 先订阅事件再渲染
      this.mainPanelProvider
        .onRootElementMounted((rootElement) => {
          document.getElementsByTagName('body')[0].addEventListener('click', () => {
            this.mainPanelProvider.clearElementSelect()
          })
          // 只针对根div做事件监听
          initContainerForLine(rootElement.firstChild, this.currentPointer)
        })
        .onMerged(() => {
          this.currentPointer(null)
        })
        .onCodeCreated((code) => {
          this.code = code
        })
        .onCodeStructureUpdated((codeRawVueInfo) => {
          if (this.$refs.codeStructure) {
            this.$refs.codeStructure.updateCode(codeRawVueInfo)
          }
          this.codeRawVueInfo = codeRawVueInfo

          this.notifyParent()
        })
        .onNodeDeleted(() => {
          this.currentEditRawInfo = null
        })
        .onSelectElement((rawInfo) => {
          this.currentEditRawInfo = rawInfo
        })
        .saveJSCodeOnly(this.convertLogicCode(this.initCodeEntity.JSCode ? this.initCodeEntity.JSCode : ''))
        .render(this.initCodeEntity.codeStructure ? this.initCodeEntity.codeStructure : this.getFakeData())
    },
    onSaveAttr({ resultList, lc_id }) {
      this.mainPanelProvider.saveAttribute(resultList, lc_id)
    },

    // 通知父组件
    notifyParent() {
      this.$emit('updateCodeEntity', {
        codeRawVueInfo: this.codeRawVueInfo,
        JSCode: this.JSCode,
      })
    },

    // 指向将要插入哪个元素之前
    currentPointer(ele, index) {
      this.mainPanelProvider.setDropInfo({
        target: ele,
        index,
      })
    },

    /**获取一个模拟的实体对象 */
    getFakeData() {
      return {
        template: {
          lc_id: 'root',
          __children: [
            {
              div: {
                class: 'container',
                lc_id: 'container',
                style: 'min-height: 100%; padding-bottom: 100px;',
                __text__: 'Hello，欢迎使用VCC编辑器，请往此区域拖拽组件',
              },
            },
          ],
        },
      }
    },

    onRemove({ lc_id }) {
      this.mainPanelProvider.remove(lc_id)
    },
  },
}
</script>

<style lang="less" scoped>
.darkmode-container {
  width: 100%;
  height: 100%;
  display: flex;
  background-color: #f0f0f0;

  .base-component-container {
    border-radius: 0px;
    background-color: white;
  }

  .main-container {
    margin: 0;
    display: flex;
    max-height: 100vh;
    flex-direction: column;
  }

  .preview-container {
    height: 0;
    flex-grow: 1;
    display: flex;
    justify-content: center;
    background-color: #f0f0f0;
  }

  #render-control-panel {
    height: 100%;
    width: 100%;
    border-radius: 0px;
    overflow: scroll;
    box-sizing: border-box;
    background-color: white;
    transition: width 1s;
    padding: 10px;
  }

  .attribute {
    width: 300px;
    border-radius: 10px;
    margin-left: 10px;
    position: absolute;
    right: calc(-300px - 20px);
    top: 10px;
    background: white;
    max-height: calc(80% - 20px);
    transition: right 0.5s;
    overflow: scroll;
    z-index: 2;
  }

  .cross-flag {
    position: fixed;
    right: 0;
    top: 0;
    .x {
      width: 20px;
      height: 2px;
      position: fixed;
      background-color: #4dba87;
      border-radius: 1px;
      top: 0;
      display: none;
      right: 0;
      pointer-events: none;
    }
    .y {
      width: 2px;
      height: 20px;
      position: fixed;
      background-color: #4dba87;
      top: 0;
      border-radius: 1px;
      display: none;
      right: 0;
      pointer-events: none;
    }
  }
}
</style>

<style lang="less">
#render-control-panel {
  position: relative;

  [div-lc-mark] {
    border: 1px grey dashed;
    min-height: 1rem;
    border-radius: 5px;
  }

  &::after {
    content: '编辑区域';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: 600;
    font-size: 40px;
    color: #d6d6d6;
    pointer-events: none;
  }
}

.mark-element-unit {
  opacity: 0.5;
  outline: red 2px solid;
}

::-webkit-scrollbar {
  /*隐藏滚轮*/
  display: none;
}

.icon-s {
  font-size: 14px;
  color: #000;
  margin: 0 2px;
}

:root {
  --animate-duration: 1.5s;
}

.in-element {
  outline: 2px solid #4dba87 !important;
  position: relative;
}

.mark-element {
  outline: 2px solid #4dba87 !important;
  position: relative;
}

.mark-element::before {
  content: attr(lc-component-name) !important;
  background: #4dba87;
  color: white;
  left: 0 !important;
  top: 0 !important;
  transform: translateY(-100%);
  position: absolute;
  font-size: 12px;
  line-height: 12px;
  padding: 1px 2px;
  border-radius: 2px;
}

.light-mark {
  outline: 2px solid #4dba87;
  position: relative;
}

.light-mark::before {
  content: attr(lc-component-name) !important;
  background: #4dba87;
  color: white;
  left: 0 !important;
  top: 0 !important;
  position: absolute;
  font-size: 12px;
  line-height: 12px;
  padding: 1px 2px;
  border-radius: 2px;
}
</style>
