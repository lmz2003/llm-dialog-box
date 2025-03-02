import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useInlineChatStore = defineStore('inlineChat', () => {
    const messages = ref([]);

    function $reset() {
      messages.value = [];
    }

    return { messages, $reset };
  })