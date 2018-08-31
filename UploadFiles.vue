<template>
  <div>
    <Upload
      :action="url"
      :name="name"
      :headers="headers"
      :on-progress="showLoading"
      :on-success="uploadSuccess"
      :on-error="uploadError"
      :format="format"
      :max-size="maxSize"
      :on-format-error="formatError"
      :with-credentials="true"
      :on-exceeded-size="maxSizeError"
      :before-upload="beforeUpload"
      :data="uploadData"
      :show-upload-list="false">
        <slot></slot>
    </Upload>
  </div>
</template>

<script>
  import Loading from './Loading'

  export default {
    name: 'upload-common',
    props: {
      url: String,
      name: String,
      format: Array,
      maxSize: Number,
      uploadData: Object,
      uploadDataField: String,
      beforeUpload: Function,
      uploadSuccess: Function,
      uploadError: Function,
      notAuto: Boolean, // 是否手动上传
      // 是否上传，为true时调用上传方法
      upload: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        isTipShow: false,
        errorTip: '',
        file: null
      }
    },
    computed: {
      maxSize () {
        let maxSize = this.maxSize
        let unit = this.sizeUnit || 'M'
        let result
        if (unit === 'K') {
          result = maxSize
        } else {
          result = this.maxSize / 1024
        }
        return result + unit
      },
      fileTypes () {
        return this.format.join('/')
      },
      headers () {
        return {
          // headers here
        }
      }
    },
    methods: {
      beforeUpload (file) {
        let notAuto = this.notAuto
        this.file = file
        // notAuto：非自动上传，即手动上传
        if (notAuto) {
          // 复制自iview校验源码，手动上传前校验
          // check format
          let format = this.format
          if (format.length) {
            const fileFormat = file.name.split('.').pop().toLocaleLowerCase()
            const checked = format.some(item => item.toLocaleLowerCase() === fileFormat)
            if (!checked) {
              this.formatError(file)
              return false
            }
          }

          // check maxSize
          let maxSize = this.maxSize
          if (maxSize) {
            if (file.size > maxSize * 1024) {
              this.maxSizeError(file)
              return false
            }
          }
        }
  
        let beforeUpload = this.beforeUpload
        beforeUpload && beforeUpload(file, this)
  
        return !notAuto
      },
      uploadSuccess (response, file, fileList) {
        let uploadSuccess = this.uploadSuccess
        uploadSuccess ? uploadSuccess(response, file, fileList, this) : this.$Message.info({content: '上传成功'})
        this.$Spin.hide()
      },
      uploadError (er, file, fileList) {
        let uploadError = this.uploadError
        uploadError ? uploadError(er, file, fileList, this) : this.$Message.info({content: '上传失败'})
        this.$Spin.hide()
      },
      showLoading () {
        this.$Spin.show({
          render: (h) => {
            return h(Loading)
          }
        })
      },
      formatError (file, fileList) {
        this.isTipShow = true
        this.errorTip = '您上传的文件格式错误'
      },
      maxSizeError (file, fileList) {
        this.isTipShow = true
        this.errorTip = '您上传的文件大小超过限制'
      },
      notAutoUpload () {
        let file = this.file
        let data = new FormData()
        data.append(this.name, file)
        if (file) {
          data.append('fileName', file.name)
        }
        // data作为json string 时使用此方法入参，循环出每一个字段的情况有需求了再添
        data.append(this.uploadDataField, JSON.stringify(this.uploadData))
  
        this.$Post(this.url, data).then(res => {
          this.uploadSuccess(res, file)
        }).catch(er => {
          this.uploadError(er, file)
        })
      }
    },
    watch: {
      upload (newVal) {
        if (newVal) {
          this.notAutoUpload()
        }
      }
    },
    components: {
      Loading
    }
  }
</script>

<style lang="scss" scoped>

</style>

