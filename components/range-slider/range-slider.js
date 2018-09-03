/**
*  @prop {Number} min: slider 最小值
*  @prop {Number} max: slider 最大值
*  @prop {Number} step: 步数
*  @prop {Boolean} isCanOverlap: 针对step步长，两个值是否能够重叠
*  @prop {Number/String} minDefaultValue: slider 左边滑块初始位置
*  @prop {Number/String} maxDefaultValue: slider 右边滑块初始位置
*  @prop {Function} lowValueChange: 左边滑块回调 {lowValue：lowValue}
*  @prop {Function} heighValueChange: 右边滑块回调 {heighValue：heighValue}
*/
const util = require('../../utils/util')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    step: {
      type: Number,
      value: 1
    },
    isCanOverlap: {
      type: Boolean,
      value: false
    },
    minDefaultValue: {
      type: Number
    },
    maxDefaultValue: {
      type: Number
    }
  },
  data: {
    min: 0,
    max: 10000,
    // 左侧按钮的left rpx值
    leftValue: 0,
    // 右侧按钮的left rpx值
    rightValue: 0,
    totalLength: 0,
    bigLength: 0,
    // 默认比例
    ratio: 0.5,
    // 按钮大小
    sliderLength: 50,
    // 默认的组件容器距离屏幕左边的距离
    containerLeft: 0
  },
  ready() {
    util.wxPromisify(wx.getSystemInfo)()
      .then(res => {
        // 基于ratio来将px转成rpx
        let ratio = res.windowWidth / 750
        this.setData({
          ratio: ratio,
        })
      })
      .then(() => {
        // 将选择器的选取范围更改为该组件
        let query = wx.createSelectorQuery().in(this)
        let container = query.select(".container")
        container.boundingClientRect((res) => {
          // 最多能够移动的距离
          let bigLength = res.width / this.data.ratio - this.data.sliderLength * 2 / 2
          this.setData({
            // 转换rpx
            totalLength: res.width / this.data.ratio - this.data.sliderLength,
            // 园块边缘计算 改为 以园块中心
            bigLength,
            rightValue: res.width / this.data.ratio - this.data.sliderLength,
            containerLeft: res.left / this.data.ratio,
            stepRpx: bigLength / this.data.max * this.data.step
          })
          /**
           * 设置初始滑块位置
           */
          this._propertyLeftValueChange()
          this._propertyRightValueChange()
        }).exec()
      })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    parseFloatDecimal(x, digits = 2) {
      let decimalNum = Math.pow(10, digits)
      let isNaN = x !== x
      if (!isNaN) {
        x = Math.floor(x * decimalNum) / decimalNum
        return x
      } else {
        throw new Error(`x is NaN`)
      }
    },
    /**
    * 设置左边滑块的值
    */
    _propertyLeftValueChange() {
      let minValue = this.data.minDefaultValue / this.data.max * this.data.bigLength
      let min = this.data.min / this.data.max * this.data.bigLength
      this.setData({
        leftValue: minValue - min
      })
    },

    /**
     * 设置右边滑块的值
     */
    _propertyRightValueChange() {
      let right = this.data.maxDefaultValue / this.data.max * this.data.bigLength
      this.setData({
        rightValue: right
      })
    },
    /**
     * 左边滑块滑动
     */
    _minMove(e) {
      let pagex = e.changedTouches[0].pageX / this.data.ratio - this.data.containerLeft - this.data.sliderLength / 2
      
      if (pagex >= this.data.rightValue) {
        pagex = this.data.rightValue
      } else if (pagex <= 0) {
        pagex = 0
      }

      let lowValue = parseInt(pagex / this.data.bigLength * parseInt(this.data.max) + this.data.min)

      if (this.isCanMove()) {
        this.setData({
          leftValue: pagex,
          lowValue
        })
        let myEventDetail = { lowValue }
        this.triggerEvent('lowValueChange', myEventDetail)
      }
    },
    /**
     * 右边滑块滑动
     */
    _maxMove(e) {
      let pagex = e.changedTouches[0].pageX / this.data.ratio - this.data.containerLeft - this.data.sliderLength / 2
      if (pagex <= this.data.leftValue) {
        pagex = this.data.leftValue
      } else if (pagex >= this.data.totalLength) {
        pagex = this.data.totalLength
      }
      
      let heightValue = parseInt(pagex / this.data.bigLength * this.data.max)

      if (this.isCanMove()) {
        this.setData({
          rightValue: pagex,
          heightValue
        })
        let myEventDetail = { heightValue }
        this.triggerEvent('heightValueChange', myEventDetail)
      }
    },
    isCanMove() {
      let { stepRpx, isCanOverlap, leftValue, rightValue } = this.data
      if (!isCanOverlap) {
        let between = this.parseFloatDecimal(rightValue - leftValue)
        console.log(between, stepRpx, Math.ceil(between) >= Math.ceil(stepRpx))
        if (Math.ceil(between) >= Math.ceil(stepRpx)) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    },
    setValueLeft() {
      this.setAutoValue('leftValue', this.data.lowValue, 'lowValueChange')
    },
    setValueRight() {
      this.setAutoValue('rightValue', this.data.heightValue, 'heightValueChange')
    },
    setAutoValue(valueName, targetValue, triggerEventName) {
      let { step, bigLength, max, stepRpx } = this.data
      if (step > 1 ) {
        // 自动设置成离有效值最近的那个数字
        // 需要将值转换为rpx
        let targetValueRpx = bigLength / max * targetValue
        // 计算最优的rpx值
        let moveToRpx = Math.round(targetValueRpx / stepRpx) * stepRpx
        let resultValue = Math.round(moveToRpx / bigLength * max)
        
        this.setData({
          [valueName]: moveToRpx
        })
      
        let triggerValueName = triggerEventName.replace('Change', '')
        var myEventDetail = { type: 'setAutoValue', [triggerValueName]: resultValue }
        this.triggerEvent(triggerEventName, myEventDetail)
        return moveToRpx
      }
      return targetValue
    }
  }
})
