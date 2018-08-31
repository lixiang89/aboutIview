<template>
    <AutoComplete
      placeholder="请输入关键字查找"
      v-model.trim="keyWords"
      @on-search="handleSearch"
      @on-change="handleChange"
      @on-focus="handleFocus">
      <div class="empty" v-if="isEmpty">暂无搜索结果</div>
      <Option v-for="item in users" :value="item.username" :key="item.userId" @click.native="handleSelect(item.username)"></Option>
    </AutoComplete>
</template>

<script>

export default {
  name: 'auto-complete-fixed',

  data () {
    return {
      keyWords: '',
      users: [],
      lastQuery: '',
      checkerTimeout: null,
      isTyping: false,
      isLoading: false,
      selected: false,
      isEmpty: false
    }
  },

  methods: {
    delay () {
      // 防抖
      if (this.checkerTimeout !== null) {
        clearTimeout(this.checkerTimeout)
      }
      this.checkerTimeout = setTimeout(() => {
        this.isTyping = false
      }, 100)
    },
    handleSearch (query = '') {
      query = query.trim()
      if (query !== '') {
        this.lastQuery = query
        if (this.isTyping) {
          this.delay()
          return
        }
        this.isLoading = true
        let paramsData = {
        }
        this.$Post('url', paramsData).then(res => {
          this.isLoading = false
          if (res.rtnCode === '000') {
            let users = res.data || []
            this.users = users
            this.isEmpty = users.length === 0
          } else {
            this.$Message.error({ content: res.rtnMsg })
          }
        }).catch((err) => {
          this.$debug(err)
          console.log(err)
        })
      }
    },
    handleChange (value) {
      this.isTyping = true
      if (this.lastQuery === '') {
        this.handleSearch(value)
      }
      if (this._isNil(value)) {
        value = this.lastQuery
        this.keyWords = this.lastQuery
      }
      if (!value.endsWith(' ')) {
        this.keyWords += ' '
      }
    },
    handleFocus (event) {
      this.handleSearch(this.keyWords)
    },
    handleSelect (value) {
      if (!this._isNil(value)) {
        this.selected = true
      } else {
        this.selected = false
        let auto = document.querySelector('.search [autocomplete]')
        auto.focus()
      }
    }
  },

  watch: {
    isTyping (newValue, oldValue) {
      if (!newValue) {
        this.handleSearch(this.keyWords)
      }
    }
  }
}
</script>
