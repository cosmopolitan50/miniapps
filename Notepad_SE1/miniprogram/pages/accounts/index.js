const app = getApp()
Page({
  data:{
    emptyDatabase:false,

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
    successAdd:false,

    date:"",
    today:"",

    years:[],
    yearsIdx:0,
    months:[],

    // a_year_bill_data:[],//集合
    a_year_bill_data_Arr:[],//数组
    // templist:[[{"12":123},{"1":123},{"123":23}],[{"q":34}],[{"1233":44}],[{"12332":44}]],//删我
  },
  refreshYear(){

    //onLoad时加载年份
    console.log("refreshYear,开始查询记录")
    var that = this
    const db=wx.cloud.database()
    const $ = db.command.aggregate
    db.collection('account_bill')
    .aggregate().group({
      _id: null,
      year: $.addToSet('$year')
    })
    .end()
    .then(function(res){
      if(res.list.length!=0){
      var arr=res.list[0].year
      arr.sort().reverse()
      that.setData({
        years:arr
      })
      // console.log(that.data.years)
    }else{
      that.setData({
        emptyDatabase:true
      })
    }
    })
    //加载年份后肯定要加载月份和日期
    //但是这些，onLoad函数另外调用了，切换年份的绑定事件也另外调用了，添加数据成功后也另外调用了refreshPage

  },
  refreshPage(){
    //数据库为空,onLoad不执行此条函数
    // if(emptyDatabase)return;
    //添加数据成功后刷新页面
    

    console.log("refreshPage,开始更新页面")
    var that = this
    const db=wx.cloud.database()
    db.collection('account_bill').where({
      year:that.data.years[that.data.yearsIdx]//页面选择的年份
    }).get({
      complete:res=>{},
      success:res=>{
        console.log("按年份查询成功")
        var i
        let monthSet = new Set()
        // 遍历每一条记录
        console.log("res.data",res.data)
        let a_year_bill_data = new Array()
        for(i=0;i<12;i++){
          a_year_bill_data[i]=new Set()
        }
        for(i=0;i<res.data.length;i++){          
          monthSet.add(Number(res.data[i].month))
          //对应月份的数据加进去          
          a_year_bill_data[Number(res.data[i].month)-1].add(res.data[i])   //坑坑！！！this.data!!!! //再次坑坑“-1”
        }
        let tempArrArr=new Array()
        for(i=0;i<12;i++){          
            tempArrArr[i]=Array.from(a_year_bill_data[i])
        }
        
        var tempArr;
        var tempArr=Array.from(monthSet)
        tempArr.sort().reverse()
        console.log(tempArr)
        // 把他弄成只渲染一次！！
        that.setData({
          months:tempArr,
          a_year_bill_data_Arr:tempArrArr
        })
      },
      fail:err=>{
        wx.showToast({title: '查询失败',icon:none})
        console.error("数据库查询失败：",err)
      }
    })
  },
  onLoad(){
    console.log("加载")
    var i
    // for(i=0;i<12;i++){
    //   this.data.a_year_bill_data[i]=new Set();
    //   // console.log("新的数组已增加",i)
    // }
    //刷新年份
    this.refreshYear()
    //刷新页面
    if(!this.data.emptyDatabase)this.refreshPage()


    this.setData({
      today:this.makeDateString(new Date()),
      date:this.makeDateString(new Date())
    })
  },
  onShow(){

  },
  onAfterEnter(){
    
  },
  makeDateString:function(dateObj){
    var temp="";
    if(dateObj.getMonth()+1<=10){
      temp="0"
    }
    return dateObj.getFullYear()+'-'+temp+(dateObj.getMonth()+1)+'-'+dateObj.getDate();
  },
  bindDateChange:function (e) {
      console.log('picker发送选择改变，携带值为', e.detail.value)
      this.setData({
        date: e.detail.value
      })
    
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
    var date=this.data.date
    var dateArr=date.split("-")
    // console.log(dateArr)
    var year = dateArr[0]
    var month = dateArr[1]
    var day = dateArr[2]
    var coi = this.data.costOrIncome
    var type= (coi=="cost") ? this.data.costType : this.data.incomeType
    var mon= e.detail.value.money    
    var remark=e.detail.value.remark
    var num_mon=Number(mon);
    // console.log("金额",num_mon)
    if(mon!=""&&!isNaN(num_mon)){//金额不能为空
      const db= wx.cloud.database()
      db.collection('account_bill').add({
        data:{
          year,
          month,
          day,
          coi,
          type,
          money:num_mon,
          remark
        },
        complete:res=>{
          // console.log("complete中的res",res)
        },
        success:res=>{
          console.log("success中的res",res)
          this.setData({
            successAdd:true,
            emptyDatabase:false
          })
          this.exitPage()
          //退出时刷新页面
          this.refreshPage()
        },
        fail:err=>{
          wx.showToast({
            title: 'none',
            title:'新增记录失败'
          })
          console.err("数据库 新增记录 失败：",err)
        }
      })
    }else{
      wx.showToast({
        title: '请检查金额输入',
        icon:'error',
        duration:2000
      })
    }
  },
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      yearsIdx: e.detail.value
    })
    //刷新页面
    //不要刷新年份
    this.refreshPage()
  },
  

})