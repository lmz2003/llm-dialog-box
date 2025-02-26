import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useChatStore = defineStore('chat', () => {
  //示例
    // const count = ref(0)
    // const doubleCount = computed(() => count.value * 2)
    // function increment() {
    //   count.value++
    // }
    // return { count, doubleCount, increment }


    // 当前会话的消息队列，用于存放用户和机器人的消息
    const messages = ref([]);

    function $reset() {
      messages.value = [];
    }

    return { messages, $reset };
  })