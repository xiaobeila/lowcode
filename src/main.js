import Vue from 'vue'
import App from './App.vue'
import ElementUI from "element-ui"

Vue.use(ElementUI);

// 内部需要同样配置的全局Vue
self.Vue = Vue;

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
