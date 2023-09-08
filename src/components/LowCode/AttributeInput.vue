<template>
  <div>AttribbuuteInput</div>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    onShow() {
      // 这种方式适用于常规模式下的初始化，因为这个实例初始化后不会被销毁，一直常驻内存。但又不能受到其它实例销毁时的影响，所以需要明确的再次初始化。
      console.log('onShow')
    },
    onHide() {
      console.log('onHide')
    },
  },
}
</script>
