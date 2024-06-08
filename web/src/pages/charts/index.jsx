import React, { PureComponent } from 'react';
import ReactECharts from 'echarts-for-react';
import {Spin,message,Button} from 'antd';
import Radio from './radio';
import Board from '../board';
import http from '../../utils/http';
import storage from '../../utils/storage';
class Chart extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // 历史基金数据
      fundData: [],
      // 查询维度
      radioValue: 'NOW',
      // 是否显示加载动画
      loading:true,
      // 实时交易及面板
      board:{},
      // 交易详情
      modal:false,
    }
  }
  async componentDidMount() {
    // 组件挂载后执行的操作
    await this.getBoard();
  }
  componentWillUnmount() {
    // 组件卸载前执行的操作
    clearTimeout(this.timer);
  }
  // 日 周 月  季 年 线
  getOptions(fundData){
    return {
      // 初始化状态
        title: {
          text: 'FUND Fund基金(数据来源：https://gushitong.baidu.com/stock/us-FUND?name=FUND)',
          left: 'center'
        },
        axisPointer:{
          link:[{xAxisIndex:[0,1]}],
        },
        xAxis: [
          {
            type: 'category',
            data: fundData.map(function (item) {
                return item.k;
            }),
            axisLine: { show: false },
            axisTick: { show: false },
            boundaryGap: false
          },
          {
            type: 'category',
            gridIndex: 1,
            data:fundData.map(function (item) {
              return item.k;
            }),
            boundaryGap: false,
            splitLine: { show: false },
            axisLabel: { show: false },
            axisTick: { show: false },
            axisLine: { show: false },
            min: 'dataMin',
            max: 'dataMax',
          }
        ],
        yAxis: [
          {
            type: 'value',
            scale: true,
            splitLine: { show: false },
            axisLine: { show: false }
          },
          {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLine: { show: false },
            splitLine: { show: false },
            axisLabel:{
              formatter: '{value}.00 万股'
            }
          }
        ],
        grid: [
          {
            left: 100,
            right: 50,
            top: 60,
            height: 300
          },
          {
            left: 100,
            right: 50,
            height: 200,
            top: 400
          }
        ],
        dataZoom:[{
          type:'slider',
          xAxisIndex: [0, 1],
          startValue:fundData[fundData.length-80]?.k,
          endValue: fundData[fundData.length-1]?.k,
          top:610,
          height:80,
          brushSelect:false
        }],
        legend: {
          data: ['ma5', 'ma10', 'ma20'],
          right: 0,
        },
        series: [
            {
                name: '基金价格',
                type: 'candlestick',
                data: fundData.map(function (item) {
                    return [item.o, item.c, item.l, item.h]; // 使用收盘价作为折线图的数据点 [open, close, lowest, highest] （即：[开盘值, 收盘值, 最低值, 最高值]）
                }),
                itemStyle: {
                  color0: '#fff',
                  color: 'rgb(0, 168, 112)',
                  borderColor0: '#FD1050',
                  borderColor: 'rgb(0, 168, 112)',
                },
                barMaxWidth: 20,
            },
            {
              name: 'ma5',
              type: 'line',
              symbol: 'none',
              data: fundData.map(function (item) {
                  return item.ma5;
              }),
              itemStyle: {
                color: '#faa90f',
              },
            },
            {
              name: 'ma10',
              type: 'line',
              symbol: 'none',
              data: fundData.map(function (item) {
                  return item.ma10;
              }),
              itemStyle: {
                color: '#f60',
              },
            },
            {
              name: 'ma20',
              type: 'line',
              symbol: 'none',
              data: fundData.map(function (item) {
                  return item.ma20;
              }),
              itemStyle: {
                color: '#416df9',
              },
            },
            {
              name: '成交量',
              type: 'bar',
              xAxisIndex: 1,
              yAxisIndex: 1,
              itemStyle: {
                color: (params)=>{
                  return params.data.o-params.data.c>0?'#FD1050':'rgb(0,168,112)';
                },
              },
              barMaxWidth: 20,
              data: fundData.map(function (item) {
                    return {value:item.v,...item};
                })
            },
        ],
        tooltip:{
          trigger: 'axis',
          valueFormatter: (value) => value,
          borderColor:'rgba(0,0,0,0)',
          formatter: (params) => {
            const bar = params.find((item) => item.seriesType === 'bar')
            return `<div style="width:180px">
                <div style="justify-content: space-between;display: flex;"><span>时间</span> <span>${bar.axisValue}</span></div>
                <div style="justify-content: space-between;display: flex;"><span>开盘价</span> <span>${bar.data.o}</span></div>
                <div style="justify-content: space-between;display: flex;"><span>最高价</span> <span>${bar.data.h}</span></div>
                <div style="justify-content: space-between;display: flex;"><span>最低价</span> <span>${bar.data.l}</span></div>
                <div style="justify-content: space-between;display: flex;"><span>收盘价</span> <span>${bar.data.c}</span></div>
                <div style="justify-content: space-between;display: flex;"><span>涨跌额</span> <span>${bar.data.cp}</span></div>
                <div style="justify-content: space-between;display: flex;"><span>涨跌幅</span> <span>${bar.data.cpr}</span></div>
                <div style="justify-content: space-between;display: flex;"><span>成交量</span> <span>${bar.data.v}万股</span></div>
                <div style="justify-content: space-between;display: flex;"><span>成交额</span> <span>${bar.data.t}</span></div>
                <div style="justify-content: space-between;display: flex;"><span>换手率</span> <span>${bar.data.r}</span></div>
              </div>`
          }
        }
    }
  }
  // 实时交易线
  getActiveOptions(board=[]){
    return {
      // 初始化状态
        title: {
          text: 'FUND Fund基金(数据来源：https://gushitong.baidu.com/stock/us-FUND?name=FUND)',
          left: 'center'
        },
        axisPointer:{
          link:[{xAxisIndex:[0,1]}],
        },
        xAxis: [
          {
            type: 'category',
            data: board.map(function (item) {
                return item.k;
            }),
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
            boundaryGap: false
          },
          {
            type: 'category',
            gridIndex: 1,
            data:board.map(function (item) {
              return item.k;
            }),
            boundaryGap: false,
            splitLine: { show: false },
            axisTick: { show: false },
            axisLine: { show: false },
            min: 'dataMin',
            max: 'dataMax',
          }
        ],
        yAxis: [
          {
            type: 'value',
            splitLine: { show: false },
            axisLine: { show: false },
            min: 'dataMin',
            max: 'dataMax',
          },
          {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLine: { show: false },
            splitLine: { show: false },
            axisLabel:{
              formatter: '{value}股'
            }
          },
          {
            type: 'value',
            position: 'right',
            splitLine: { show: false },
            axisLine: { show: false },
            min: 'dataMin',
            max: 'dataMax',

          },
        ],
        grid: [
          {
            left: 100,
            right: 50,
            top: 60,
            height: 300
          },
          {
            left: 100,
            right: 50,
            height: 200,
            top: 400
          },
          {
            left: 100,
            right: 50,
            height: 200,
            top: 400
          }
        ],
        series: [
            {
              name: '价格',
              type: 'line',
              step: 'start',
              symbol: 'none',
              yAxisIndex: 2,
              data: board.map(function (item) {
                return item.avg;
              }),
              itemStyle: {
                color: '#faa90f',
              },
            },
            {
              name: '涨跌幅',
              type: 'line',
              step: 'start',
              symbol: 'none',
              data: board.map(function (item) {
                return item.cpr;
              }),
              itemStyle: {
                color: '#416df9',
              },
            },
            {
              name: '成交量',
              type: 'bar',
              xAxisIndex: 1,
              yAxisIndex: 1,
              itemStyle: {
                color: (params)=>{
                  return'rgb(0,168,112)';
                },
              },
              barMaxWidth: 20,
              data: board.map(function (item) {
                    return {value:item.v,...item};
                })
            },
        ],
        tooltip:{
          trigger: 'axis',
          valueFormatter: (value) => value,
          borderColor:'rgba(0,0,0,0)',
          formatter: (params) => {
            const bar = params.find((item) => item.seriesType === 'bar')
            return `<div style="width:180px">
                <div style="justify-content: space-between;display: flex;"><span>时间</span> <span>${bar.data.k}</span></div>
                <div style="justify-content: space-between;display: flex;"><span>价格</span> <span>${bar.data.p}</span></div>
                <div style="justify-content: space-between;display: flex;"><span>涨跌额</span> <span>${bar.data.cp}</span></div>
                <div style="justify-content: space-between;display: flex;"><span>涨跌幅</span> <span>${bar.data.cpr}</span></div>
                <div style="justify-content: space-between;display: flex;"><span>均价</span> <span>${bar.data.avg}</span></div>
                <div style="justify-content: space-between;display: flex;"><span>成交量</span> <span>${bar.data.v}股</span></div>
                <div style="justify-content: space-between;display: flex;"><span>成交额</span> <span>${bar.data.t}</span></div>
              </div>`
          }
        }
    }
  }
  // 获取 日 周 月  季 年 线数据
  getData(type = 'DAY'){
    // 有缓存就不再请求
    if(storage.getItem(type)){
      this.setState({
        fundData: storage.getItem(type),
      })
      return;
    }
    this.setState({
      loading:true
    })
    http.get('/funds',{
      params:{type}
    }).then(({data})=>{
      if(data && data.code === 0){
        this.setState({
          fundData: data.data.list,
        })
      }
      storage.setItem(type,data.data.list)
    }).catch(err=>{
      message.error(err.message);
    }).finally(()=>{
      this.setState({
        loading:false
      })
    })

  }
// 获取看板、实时活动数据
  getBoard(){
    clearTimeout(this.timer);
    http.get('/board').then(({data})=>{
      if(data && data.code === 0){
        this.setState({
          board: data.data,
          loading:false
        })
      }
    }).catch(err=>{
      message.error(err.message);
    }).finally(()=>{
      // 休盘就不再轮询
      this.timer = setTimeout(()=>{
        if(this.state.board?.update?.stockStatus !== '已收盘'){
          this.getBoard();
        }
      },3*1000)
    })
  }
  handleSizeChange = (e) => {
    this.setState({
      radioValue:e.target.value
    })
    if(e.target.value === 'NOW'){
      this.getBoard();
    }else{
      clearTimeout(this.timer);
      this.getData(e.target.value);
    }
  }
  // 查看实时交易量
  toView = () => {
    this.setState({
      modal:true
    })
  }
  render() {
    const {fundData,radioValue,loading,board,modal} = this.state
    return (
      <div style={{ padding: '20px' }}>
        <Spin spinning={loading} fullscreen={true}/>
        <Board {...board} modal={modal} onClose={()=>{
          this.setState({
            modal:false
          })
        }}/>
        <Radio handleSizeChange={this.handleSizeChange} radioValue={radioValue}/>
        {
          radioValue !== 'NOW' ? <ReactECharts
              style={{ height: '900px', width: '100%' }}
              option={this.getOptions(fundData)}
              notMerge={true}
              lazyUpdate={true}
          />:
          <div>
            <Button onClick={this.toView} style={{position:'relative',top:'-32px',left:'500px'}} type='primary'>交易详情</Button>
            <ReactECharts
                style={{ height: '900px', width: '100%' }}
                option={this.getActiveOptions(board.marketData)}
                notMerge={true}
                lazyUpdate={true}
              />
          </div>
        }
      </div>
    );
  }
}

export default Chart;