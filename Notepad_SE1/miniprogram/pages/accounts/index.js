const app = getApp()
Page({
  data:{
    dayIncome:0,
    dayCost:0,

    //这里是假页设置
    show: false,
    duration: 300,
    position: 'top',
    round: false,
    overlay: true,
    customStyle: '',
    overlayStyle: '',

    costOrIncome:"cost",
    costType:"food",
    incomeType:"salary",

    initInput:"",
    successAdd:false
  },
  writeABillPopup(e){    
    let customStyle = ''
    let duration = this.data.duration
    //中部弹出
    this.setData({
      position:"center",
      show: true,
      customStyle,
      duration
    })
  },
  onBeforeEnter(){
    console.log("这个不能是true",this.data.successAdd)
  },
  onBeforeLeave(){
    console.log("离开之前清空")
    this.setData({
      initInput:""
    })
  },
  exitPage() {
    this.setData({show: false})
    // wx.navigateBack()
    if(this.data.successAdd){
      wx.showToast({
        title: '添加成功',
        icon: 'success',
        duration: 2000
      })
    }
    this.setData({
      successAdd:false
    })
  },
  selCost(){
    this.setData({
      costOrIncome:"cost"
    })
  },
  selIncome(){
    this.setData({
      costOrIncome:"income"
    })
  },
  selCostType(e){
    // console.log(e);
    var ct=e.target.id
    this.setData({
      costType:ct
    })
  },
  selIncomeType(e){
    // console.log(e);
    var it=e.target.id
    this.setData({
      incomeType:it
    })
  },
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var coi = this.data.costOrIncome
    var type= (coi=="cost") ? this.data.costType : this.data.incomeType
    var mon= e.detail.value.money    
    var remark=e.detail.value.remark
    if(mon!=""){//金额不能为空
      const db= wx.cloud.database()
      db.collection('account_bill').add({
        data:{
          type,
          money:Number(mon),
          remark

        },
        complete:res=>{
          // console.log("complete中的res",res)
        },
        success:res=>{
          console.log("success中的res",res)
          this.setData({
            successAdd:true
          })
          this.exitPage()
        }
      })
    }
  }
  

})