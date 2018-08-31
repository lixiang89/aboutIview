<template>
  <div>
    <Upload
      :action="action"
      :name="params.name"
      :headers="headers"
      :on-progress="showLoading"
      :on-success="uploadSuccess"
      :on-error="uploadError"
      :format="params.format"
      :max-size="params.maxSize"
      :on-format-error="formatError"
      :with-credentials="true"
      :on-exceeded-size="maxSizeError"
      :before-upload="beforeUpload"
      :data="params.data"
      :show-upload-list="false">
        <slot></slot>
    </Upload>
    <tip-modal v-model="isTipShow" :params="tipParams"></tip-modal>
  </div>
</template>

<script>
  import Loading from '@comp/widgets/Loading'
  import TipModal from '@comp/widgets/TipModal'
  import { mapGetters } from 'vuex'

  export default {
    name: 'upload-common',
    props: {
      params: Object,
      // 是否上传，为true时调用上传方法
      upload: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        uploadUrl: '/router/post',
        isTipShow: false,
        errorTip: '',
        file: null
      }
    },
    computed: {
      ...mapGetters({
        token: 'token'
      }),
      maxSize () {
        let maxSize = this.params.maxSize
        let unit = this.params.sizeUnit || 'M'
        let result
        if (unit === 'K') {
          result = maxSize
        } else {
          result = this.params.maxSize / 1024
        }
        return result + unit
      },
      fileTypes () {
        return this.params.format.join('/')
      },
      url () {
        const urlPrefix = process.env.PLAT_PRE_URL
        return urlPrefix + this.params.url
      },
      action () {
        let url = process.env.NODE_ENV === 'development' ? this.params.url : this.uploadUrl
        return process.env.API_CONF.baseURL + url
      },
      headers () {
        return {
          'H-EClientName': 'electronPackage',
          'H-EClientVersion': '1.0.0',
          'H-ReqID': +new Date(),
          'H-Auth': this.$encrypt(this.token),
          'H-RedirectUrl': this.$encrypt(this.url)
        }
      },
      tipParams () {
        return {
          title: '提示',
          content: `<div>
                <div style="color: #F51D04;">${this.errorTip}</div>
                <div style="font-size:12px;color:#666;margin-top:10px;line-height:24px;">
                  <div>· 文件仅支持${this.fileTypes}格式</div>
                  <div>· 单个文件小于${this.maxSize}</div>
                </div>
              </div>`,
          oneBtn: true
        }
      }
    },
    methods: {
      beforeUpload (file) {
        let notAuto = this.params.notAuto
        this.file = file
        // notAuto：非自动上传，即手动上传
        if (notAuto) {
          // 复制自iview校验源码，手动上传前校验
          // check format
          let format = this.params.format
          if (format.length) {
            const fileFormat = file.name.split('.').pop().toLocaleLowerCase()
            const checked = format.some(item => item.toLocaleLowerCase() === fileFormat)
            if (!checked) {
              this.formatError(file)
              return false
            }
          }

          // check maxSize
          let maxSize = this.params.maxSize
          if (maxSize) {
            if (file.size > maxSize * 1024) {
              this.maxSizeError(file)
              return false
            }
          }
        }
  
        let beforeUpload = this.params.beforeUpload
        beforeUpload && beforeUpload(file, this)
  
        return !notAuto
      },
      uploadSuccess (response, file, fileList) {
        let uploadSuccess = this.params.uploadSuccess
        uploadSuccess ? uploadSuccess(response, file, fileList, this) : this.$Message.info({content: '上传成功'})
        this.$Spin.hide()
      },
      uploadError (er, file, fileList) {
        let uploadError = this.params.uploadError
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
        data.append(this.params.name, file)
        if (file) {
          data.append('fileName', file.name)
        }
        // data作为json string 时使用此方法入参，循环出每一个字段的情况有需求了再添
        data.append(this.params.dataField, JSON.stringify(this.params.data))
  
        this.$Post(this.params.url, data).then(res => {
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
      Loading,
      TipModal
    }
  }
</script>

<style lang="scss" scoped>

</style>

