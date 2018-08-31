<template>
  <div style="overflow: hidden;">
    <Table
    :columns="columns"
    class="excel-table"
    :data="data"
    :loading="isLoading"
    :no-data-text="noDataText"
    @on-row-click="rowClick"
    :size="tableSize">
      <loading slot="loading"></loading>
    </Table>
    <section v-show="showPage" class="pagination">
      <Page
      :total="total"
      :current="pageNo"
      @on-change="reloadData"
      :page-size="pageSize"
      :size="paginationSize"></Page>
    </section>
  </div>
</template>

<script>
  import Loading from './Loading.vue'
  export default {
    name: 'pagination-table',
    props: {
      columns: Array,
      data: Array,
      isLoading: Boolean,
      tableSize: {
        type: String,
        default: 'default'
      },
      total: [String, Number],
      pageNo: {
        type: [String, Number],
        default: 1
      },
      pageSize: {
        type: [String, Number],
        default: 10
      },
      paginationSize: {
        type: String,
        default: 'small'
      },
      noDataText: {
        type: String,
        default: '暂无数据'
      },
      showPagination: {
        type: Boolean,
        default: true
      },
      rowClick: {
        type: Function,
        default: () => {}
      }
    },
    data () {
      return {
      }
    },

    computed: {
      showPage () {
        return this.showPagination && (this.data.length !== 0)
      }
    },

    mounted () {

    },

    methods: {
      reloadData (pageNo = 1) {
        this.$emit('reloadData', pageNo)
      }
    },

    components: {
      Loading
    }
}
</script>

<style lang='scss' scoped>
  .pagination{
    margin: 30px;
    float: right;
  }
</style>
