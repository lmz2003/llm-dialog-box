import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useChatStore = defineStore('chat', () => {
    const messages = ref([]);

    function $reset() {
      messages.value = [];
    }

    return { messages, $reset };
  })