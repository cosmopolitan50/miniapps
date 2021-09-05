Page({
  data:{
    tools:[
      {
        "name":"手持弹幕",
        "image_src":"/images/bullet.png",
        "bind":"jumpToBullet"
      },
      
    ]
  },
  jumpToBullet(){
    wx.navigateTo({
      url: '../pre_bullet/pre_bullet',
    })
  }

})