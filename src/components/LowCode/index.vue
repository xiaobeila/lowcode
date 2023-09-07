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
            <attribute-input :enableRemoveButton="true" class="attribute" @save="onSaveAttr" @remove="onRemove"
                ref="attributeInput" shortcutInitMode="hand" :__rawVueInfo__="currentEditRawInfo">
            </attribute-input>
        </div>
    </div>
</template>

<script>
import RawComponents from './RawComponents'
import AttributeInput from './AttributeInput'
// // 这个文件不可以进行懒加载，它会导致运行时不可点击的行为，具体原因未知
import { MainPanelProvider } from "@/utils/libs/main-panel";

import { splitInit } from "@/utils/libs/split-init"
import { initContainerForLine } from "@/utils/lineHelper";

export default {
    name: 'LowCode',
    props: {
        initCodeEntity: {
            type: Object,
            default: () => {
                return {};
            }
        }
    },
    data() {
        return {
            currentEditRawInfo: '',
            JSCode: ''
        }
    },
    watch: {
        currentEditRawInfo(newValue) {
            const attributeContainter = document.querySelector(".attribute");
            if (newValue) {
                attributeContainter.style = "right:10px; display:block;";
                this.$refs['attributeInput'].onShow();
            } else {
                attributeContainter.style = "right: calc(-300px - 20px); display:none;";
                this.$refs['attributeInput'].onHide();
            }
        },
        initCodeEntity(newVal) {
            if (newVal.JSCode) {
                this.mainPanelProvider.saveJSCodeOnly(this.convertLogicCode(newVal.JSCode));
            }

            if (newVal.codeStructure) {
                this.mainPanelProvider.render(newVal.codeStructure);
            }
        }
    },
    components: {
        RawComponents,
        AttributeInput
    },
    mounted() {
        Promise.all([import("@/map/load")])
            .then(() => {
                this.$emit("onLoadFinish");
                this.init();
            });
        splitInit();
    },
    created() {
        this.mainPanelProvider = new MainPanelProvider();
    },
    methods: {
        convertLogicCode(JSCode) {
            try {
                const JSCodeInfo = eval(`(function(){return ${JSCode.replace(/\s+/g, "")}})()`);
                // 保留JS代码
                this.JSCode = JSCode;
                if (this.$refs.codeEditor) {
                    this.$refs.codeEditor.updateLogicCode(JSCode);
                }
                return JSCodeInfo;
            } catch (e) {
                console.warn(`外部逻辑代码解析出错，解析的逻辑代码为: ${JSCode}, Error: ${e}`);
            }
        },
        init() {
            // 先订阅事件再渲染
            this.mainPanelProvider.onRootElementMounted(rootElement => {
                document.getElementsByTagName('body')[0].addEventListener("click", () => {
                    this.mainPanelProvider.clearElementSelect();
                })
                // 只针对根div做事件监听
                initContainerForLine(rootElement.firstChild, this.currentPointer);
            }).onMerged(() => {
                this.currentPointer(null);
            }).onCodeCreated(code => {
                this.code = code;
            }).onCodeStructureUpdated(codeRawVueInfo => {
                if (this.$refs.codeStructure) {
                    this.$refs.codeStructure.updateCode(codeRawVueInfo);
                }
                this.codeRawVueInfo = codeRawVueInfo;

                this.notifyParent();
            }).onNodeDeleted(() => {
                this.currentEditRawInfo = null;
            }).onSelectElement(rawInfo => {
                this.currentEditRawInfo = rawInfo;
            }).saveJSCodeOnly(this.convertLogicCode(this.initCodeEntity.JSCode ? this.initCodeEntity.JSCode : ''))
                .render(this.initCodeEntity.codeStructure ? this.initCodeEntity.codeStructure : this.getFakeData());
        },
        onSaveAttr({ resultList, lc_id }) {
            this.mainPanelProvider.saveAttribute(resultList, lc_id);
        },


        // 通知父组件
        notifyParent() {
            this.$emit('updateCodeEntity', {
                codeRawVueInfo: this.codeRawVueInfo,
                JSCode: this.JSCode
            });
        },

        /**获取一个模拟的实体对象 */
        getFakeData() {
            return {
                template: {
                    lc_id: "root",
                    __children: [{
                        div: {
                            class: "container",
                            "lc_id": "container",
                            "style": "min-height: 100%; padding-bottom: 100px;",
                            __text__: "Hello，欢迎使用VCC编辑器，请往此区域拖拽组件",
                        }
                    }]
                },
            }

        },

        onRemove({ lc_id }) {
            this.mainPanelProvider.remove(lc_id);
        },
    }
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
}
</style>