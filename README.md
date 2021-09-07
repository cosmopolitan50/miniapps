### AppID（小程序ID）

wxfff4236b2330e845

### 文件结构

```tree
目录树
──Notepad_SE1
    ├─cloudfunctions
    │  └─quickstartFunctions
    │      ├─createCollection
    │      ├─getMiniProgramCode
    │      ├─getOpenId
    │      ├─selectRecord
    │      ├─sumRecord
    │      └─updateRecord
    └─miniprogram
        ├─components
        │  └─cloudTipModal
        ├─images
        └─pages
            ├─accounts
            ├─accounts_sta
            ├─bullet
            ├─createCollection
            ├─deployService
            ├─getMiniProgramCode
            ├─getOpenId
            ├─index
            ├─logs
            ├─me
            ├─notes
            ├─picAndText
            ├─pre_bullet
            ├─selectRecord
            ├─sumRecord
            ├─sumRecordResult
            ├─tool
            ├─updateRecord
            ├─updateRecordResult
            ├─updateRecordSuccess
            └─uploadFile


```

### 计划

#### 记账功能

顶部显示：时间，收入，支出。

显示本月日期的列表：

* 列表头可以小计

* 类别，支出/收入金额
  * 支出：餐饮、日用、交通（暂定）
  * 收入：工资、奖金（暂定）
* 类型筛选
* 数据修改（左滑删除与修改）

醒目的开始记账按钮

* 收入支出的选择
* 类别选择
* 日期选择（默认”今天“）
* 弹出数字输入框（需不需要支持运算式？）
* 备注

统计

* 分类统计

数据库中存储的数据结构

* 日期、收支、类别、金额、备注
