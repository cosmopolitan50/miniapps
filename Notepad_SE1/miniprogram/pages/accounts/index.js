const app = getApp()
Page({
  data:{
    //从getOpenID搬迁
    showUploadTip: false,
    haveGetOpenId: false,
    envId: '',
    openId: '',


    //当前数据库是否为空 //或者没登录
    emptyDatabase:false,

    dayIncome:0,
    dayCost:0,
    monthsCost:[0,0,0,0,0,0,0,0,0,0,0,0],
    monthsIncome:[0,0,0,0,0,0,0,0,0,0,0,0],


    // 支出的项目
    costTypeList:[
      {"sym":"food","name":"餐饮","tempSumOfAyear":0},
      {"sym":"dUse","name":"日用","tempSumOfAyear":0},
      {"sym":"tras","name":"交通","tempSumOfAyear":0},
      {"sym":"ent","name":"娱乐","tempSumOfAyear":0},
    ],

    //收入的项目
    incomeTypeList:[
      {"sym":"salary","name":"工资","tempSumOfAyear":0},
      {"sym":"bonus","name":"奖金","tempSumOfAyear":0},
      {"sym":"monMan","name":"理财","tempSumOfAyear":0},
    ],

    slideButtons:[
      {
        "type":"default",
        "text":"修改",
        // "extClass":"slideModBtn",
        "data":"modifyBill"
      },
      {
        "type":"warn",
        "text":"删除",
        // "extClass":"slideDelBtn",
        "data":"DeleteBill"
      }
    ],

    //这里是假页设置
    show: false,
    duration: 300,
    position: 'top',
    round: false,
    overlay: true,
    // overlayStyle: '',
    // customStyle : '',
    overlayStyle: 'z-index:99',
    customStyle : 'z-index:999',

    //存ID
    id_showModForm:'',

    // 默认选项
    costOrIncome:"cost",
    costType:"food",
    incomeType:"salary",

    initInput:"",
    successAdd:false,

    initInput_m_money:"",
    initInput_m_remarks:"",
    successMod:false,

    date:"",
    today:"",

    years:[],   //账单涉及到的年份
    yearsIdx:0,
    months:[],

    // a_year_bill_data:[],//集合
    a_year_bill_data_Arr:[],//数组
    
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
        var tMsCt = new Array(0,0,0,0,0,0,0,0,0,0,0,0)
        var tMsIc = new Array(0,0,0,0,0,0,0,0,0,0,0,0)
        for(i=0;i<res.data.length;i++){          
          monthSet.add(Number(res.data[i].month))
          //对应月份的数据加进去          
          a_year_bill_data[Number(res.data[i].month)-1].add(res.data[i])   //坑坑！！！this.data!!!! //再次坑坑“-1”
          //每月数据
          console.log("查下来的res.data到底给了什么",res.data[i])
          if(res.data[i].coi=="cost"){
            tMsCt[Number(res.data[i].month)-1]+=res.data[i].money;
          }else{
            tMsIc[Number(res.data[i].month)-1]+=res.data[i].money;
          }
          //年度分类数据暂时不算
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
          a_year_bill_data_Arr:tempArrArr,
          monthsCost:tMsCt,
          monthsIncome:tMsIc
        })
      },
      fail:err=>{
        wx.showToast({title: '查询失败',icon:none})
        console.error("数据库查询失败：",err)
      }
    })
  },
  refreshMonthsArr(){
    //主要用来解决Month数组只依赖于 a year bill
    var i
    var tempArr=new Array()
    for(i=0;i<this.data.a_year_bill_data_Arr.length;i++){
      if(this.data.a_year_bill_data_Arr[i].length>0)tempArr.push(i+1);
    }
    tempArr.sort().reverse()
    this.setData({
      months:tempArr
    })
  },
  initPage(){
    //刷新年份
    this.refreshYear()
    //刷新页面
    if(!this.data.emptyDatabase)this.refreshPage()
    this.setData({
      today:this.makeDateString(new Date()),
      date:this.makeDateString(new Date()),
      
    })
  },
  onLoad(options){
    console.log("加载")
    if(this.data.haveGetOpenId){
      initPage()
    }
    this.setData({
      //从getOpenID搬迁
      envId: options.envId
    })
   
    
  },
  onShow(){

  },
  

  //ISO日期的字符串拼接
  makeDateString:function(dateObj){
    var tempMonO="";
    var tempDayO="";
    if(dateObj.getMonth()+1<10){
      tempMonO="0"
    }
    if(dateObj.getDate()<10){
      tempDayO="0"
    }
    return dateObj.getFullYear()+'-'
      +tempMonO+(dateObj.getMonth()+1)+'-'
      +tempDayO+dateObj.getDate();
  },
  bindDateChange:function (e) {
      console.log('picker发送选择改变，携带值为', e.detail.value)
      this.setData({
        date: e.detail.value
      })
    
  },
  writeABillPopup(e){
    //兼顾登录功能
    if(!this.data.haveGetOpenId){  
      //获取openID
      this.getOpenId()
      this.initPage()
      return;
    }  

    let position = this.data.position
    let customStyle = this.data.customStyle
    let duration = this.data.duration
    let overlayStyle = this.data.overlayStyle
    //中部弹出
    this.setData({
      position,
      show: true,
      customStyle,
      duration,
      overlayStyle
    })
  },
  
  onBeforeEnter(){
    // console.log("这个不能是true",this.data.successAdd)
  },
  onBeforeLeave(){
    // console.log("离开之前清空")
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

  //提交增加记录表单
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
        complete:res=>{},
        success:res=>{
          console.log("记账成功中的res",res)
          this.setData({
            successAdd:true,
            emptyDatabase:false
          })
          this.exitPage()

          console.log(this.data.years)
          //遍历数组
          var i
          var hasThatYear=false
          for(i=0;i<this.data.years.length;i++){
            if(this.data.years[i]==year){
              hasThatYear=true
              break;
            }
          }
          // console.log("这一年存不存在？",hasThatYear)
          
          /***********避免频繁查询数据库时的优化操作************/
          //如果年份是新的，直接假装加入年份选择列表（注意，把条目的ID也加进去，因为要查找
          if(!hasThatYear){
            var tArr=this.data.years
            tArr.push(year)
            tArr.sort().reverse()
            this.setData({
              years:tArr
            })
          }
          else{//年份不是新的    
            var isTheSelectedYear=false
            if(this.data.years[this.data.yearsIdx]==year)isTheSelectedYear=true
            if(isTheSelectedYear){//是所选的年份，直接假装加入账单列表（附带渲染了）

              //一、准备好每月的数据条目
              var arr=this.data.a_year_bill_data_Arr
              arr[Number(month)-1].push({
                "_id":res._id,
                //我没加openID
                "coi":coi,
                "day":day,
                "money":num_mon,
                "month":month,
                "remark":remark,
                "type":type,
                "year":year
              })

              //二、准备好当前月的统计数统计数
              var tArrMonthIorC=(coi=="cost")?this.data.monthsCost:this.data.monthsIncome
              tArrMonthIorC[Number(month)-1]+=num_mon

              

              // var i
              // var hasThatMonth = false
              // for(i=0;i<this.data.months.length;i++){
              //   if(Number(month)==this.data.months[i]){
              //     hasThatMonth=true
              //     break;
              //   }
              // }
              // var tArrAddMonth=this.data.months
              // if(!hasThatMonth){
              //   tArrAddMonth.push(Number(month))
              //   tArrAddMonth.sort().reverse()
              // }

              if(coi=="cost"){
                this.setData({
                  a_year_bill_data_Arr:arr,
                  monthsCost:tArrMonthIorC,
                  // months:tArrAddMonth
                })
              }else{
                this.setData({
                  a_year_bill_data_Arr:arr,
                  monthsIncome:tArrMonthIorC,
                  // months:tArrAddMonth
                })
              }
              //三、准备好更新存在的月份
              this.refreshMonthsArr()
              // console.log(this.data.a_year_bill_data_Arr)
            }else{//不是所选的年份，什么都不用干
                //do nothing
            }
          }

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

  //提交修改表单
  formSubmit_updateBill(e){
    console.log("修改表单带了啥数据",e)
  },

  //年份选择器变更
  bindPickerChange: function (e) {
    var lastSelYear=this.data.yearsIdx
    console.log('picker发送选择改变，携带值为', e.detail.value)
    if(lastSelYear==e.detail.value)return;//减少页面刷新
    this.setData({
      yearsIdx: e.detail.value
    })
    //刷新页面
    //不要刷新年份
    this.refreshPage()
  },
  
  slideButtonTap(e){
    // console.log('slide button tap', e);
    switch(e.detail.data){
      case "modifyBill":
        console.log("修改操作")
        this.setData({
          id_showModForm:e.target.id
        })
        break
      case "DeleteBill":
        console.log("删除操作")
        break
      default:console.err("err in slideButtonTap")
    }
  },



  //从getOpenID搬迁
  getOpenId() {
    wx.showLoading({
      title: '获取openID中',
    })
   wx.cloud.callFunction({
      name: 'quickstartFunctions',
      config: {
        env: this.data.envId
      },
      data: {
        type: 'getOpenId'
      }
    }).then((resp) => {
      this.setData({
        haveGetOpenId: true,
        openId: resp.result.openid
      })
     wx.hideLoading()
     console.log("获取到的openID为",this.data.openId)
     console.log("是否获取到openID",this.data.haveGetOpenId)
   }).catch((e) => {
      this.setData({
        showUploadTip: true
      })
     wx.hideLoading()
     
    })
  },

  clearOpenId() {
    this.setData({
      haveGetOpenId: false,
      openId: ''
    })
  },

  cancelMod(){
    this.setData({
      id_showModForm:''
    })
  }


})