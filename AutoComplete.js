export default {
  data () {
    return {
      isTyping: false,
      checkerTimeout: null,
      // keyWords: '',
      serachResult: null,
      selectResult: null,
      isEmpty: false,
      lastQuery: '',
      selected: false
    }
  },
  computed: {
    emptyAlwaysShow () {
      return this.autoComplete.emptyAlwaysShow
    },
    keyWords: {
      get: function () {
        return this._get(this, this.autoComplete.keyWordsMap)
      },
      set: function (value) {
        this._set(this, this.autoComplete.keyWordsMap, value)
      }
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
      }, 500)
    },
    handleSearch (query = '') {
      query = query.trim()
      if (query) {
        this.lastQuery = query
        if (this.isTyping) {
          this.delay()
          return
        }
        let paramsData = Object.assign({}, {[this.autoComplete.queryField]: this.keyWords}, {
          escapeLoading: true
        })
        this.$http.post(this.autoComplete.url, paramsData).then(res => {
          if (res.rtnCode === '000') {
            this.autoComplete.successHandle(res.data)
          } else {
            this.$Message.error({ content: res.rtnMsg })
          }
        }).catch((err) => {
          this.$debug(err)
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
        this.autoComplete.findHandle(value)
      } else {
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
    },
    keyWords (newValue) {
      if (this.emptyAlwaysShow) {
        return
      }

      if (newValue === '') {
        this.isEmpty = false
      }
    }
  }
}
