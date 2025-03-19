import { defineStore } from 'pinia';

export const useLoadingStore = defineStore('loading', {
  state: () => ({
    isLoading: false,
    loadingText: '加载中...',
    error: null
  }),
  actions: {
    startLoading(text) {
      this.isLoading = true;
      this.loadingText = text || '加载中...';
      this.error = null;
    },
    endLoading() {
      this.isLoading = false;
    },
    setError(error) {
      this.error = error;
      this.isLoading = false;
    }
  }
});