//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    lowValue: 0,
    heightValue: 1000,
    lowValue2: 0,
    heightValue2: 1000,
    lowValue3: 0,
    heightValue3: 1000
  },
  getRangeSliderLowValue: function (e) {
    this.setData({
      lowValue: e.detail.lowValue
    })
  },
  getRangeSliderHeightValue: function (e) {
    this.setData({
      heightValue: e.detail.heightValue
    })
  },

  getRangeSliderLowValue2: function (e) {
    this.setData({
      lowValue2: e.detail.lowValue
    })
  },
  getRangeSliderHeightValue2: function (e) {
    this.setData({
      heightValue2: e.detail.heightValue
    })
  },

  getRangeSliderLowValue3: function (e) {
    this.setData({
      lowValue3: e.detail.lowValue
    })
  },
  getRangeSliderHeightValue3: function (e) {
    this.setData({
      heightValue3: e.detail.heightValue
    })
  }
})
