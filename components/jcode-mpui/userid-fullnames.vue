<template>
  <view style="display: flex; align-items: center; min-height: 36px">
    <view>
      <jcode-user-fullname
        v-for="(userId, i) of userIds"
        :key="i"
        :value="userId"
      >
      </jcode-user-fullname>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    default: null,
  },
  userIds: {
    type: Array,
    default: () => [],
  },

  disabled: Boolean,
});
defineOptions({ name: 'jcode-user-picker' });
</script>
