<template>
    <div class="container">
        <nav>
            <div :index="index + ''" v-for="(item, index) in iconArray" @click="onSelectElement(index)" :key="item.icon"
                :class="{ 'active': currentIndex === index }" class="main-icon-container">
                <img v-if="item.enable" :src="item.icon" class="l-icon">
            </div>
        </nav>

        <div style="overflow:scroll;padding:0 10px;">
            <keep-alive>
                <component :is="currentSelectBrand.componentName" @mounted='onMouted(currentIndex)'></component>
            </keep-alive>
        </div>
    </div>
</template>

<script>
import raw from '../rawComponents/raw/index'

export default {
    name: 'RawComponents',
    data() {
        return {
            currentIndex: 0,
            iconArray: [{
                icon: ('https://static.imonkey.xueersi.com/download/vcc-resource/logo/html-n.png'),
                clickCallback: this.onSelectElement,
                className: "demonstration-raw",
                enable: true,
                componentName: 'raw',
                titleArray: [],
            }],
        }
    },
    computed: {
        currentSelectBrand() {
            return this.iconArray[this.currentIndex];
        }
    },
    components: {
        raw
    },
    mounted() {
        this.init();
    },
    methods: {
        onSelectElement(index) {
            if (this.iconArray[index].enable) {
                this.currentIndex = index;
            }
        },
        init() {
            this.initOnly(this.iconArray[0]);
        },
        onMouted(index) {
            this.initOnly(this.iconArray[index]);
        },
        /**
         * 初始化组件导航栏，只有2个及以上的组件类才会出现
         */
        initOnly(mountedObject) {
            const titles = document.getElementsByClassName(mountedObject.className);

            if (titles.length > 1) {
                for (let i = 0; i < titles.length; i++) {
                    const element = titles[i];
                    const arr = element.textContent.split(' ');
                    mountedObject.titleArray.push({
                        titleChinese: arr.length === 2 ? arr[1] : arr[0],
                        titleEnglish: arr.length === 1 ? null : arr[0],
                        element: element
                    })
                }
            } else if (titles.length === 1) {
                mountedObject.onlyTitle = {
                    element: titles[0]
                }
            }
        },
    }

}
</script>

<style lang="less" scoped>
.container {
    .l-icon {
        width: 34px;
        height: 34px;
        border-radius: 5px;
    }
}
</style>