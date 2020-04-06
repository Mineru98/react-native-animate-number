/**
 * @author Mineru98
 * @version 0.2.0
 */

// @flow

import React, { Component } from 'react';
import {
  Text,
  View
} from 'react-native';
import Timer from 'react-timer-mixin';

const HALF_RAD = Math.PI/2

export default class AnimateNumber extends Component {

  props : {
    countby? : ?number,
    interval? : ?number,
    steps? : ?number,
    value : number,
    timing : 'linear' | 'easeOut' | 'easeIn' | () => number,
    onProgress : () => {},
  };

  static defaultProps = {
    interval : 14,
    timing : 'linear',
    steps : 45,
    value : 0,
  };

  static TimingFunctions = {

    linear : (interval:number, progress:number):number => {
      return interval
    },

    easeOut : (interval:number, progress:number):number => {
      return interval * Math.sin(HALF_RAD*progress) * 5
    },

    easeIn : (interval:number, progress:number):number => {
      return interval * Math.sin((HALF_RAD - HALF_RAD*progress)) * 5
    },

  };

  state : {
    value? : ?number,
    displayValue? : ?number
  };

  /**
   * Animation direction, true means positive, false means negative.
   * @type {bool}
   */
  direction : bool;
  /**
   * Start value of last animation.
   * @type {number}
   */
  startFrom : number;
  /**
  * End value of last animation.
  * @type {number}
   */
  endWith : number;

  constructor(props:any) {
    super(props);
    // default values of state and non-state variables
    this.state = {
      value : 0,
      displayValue : 0
    }
    this.dirty = false;
    this.startFrom = 0;
    this.endWith = 0;
  }

  componentDidMount() {
    this.startFrom = this.state.value
    this.endWith = this.props.value
    this.dirty = true
    this.startAnimate()
  }

  UNSAFE_componentWillUpdate(nextProps, nextState) {

    // check if start an animation
    if(this.props.value !== nextProps.value) {
      this.startFrom = this.props.value
      this.endWith = nextProps.value
      this.dirty = true
      this.startAnimate()
      return
    }
    // Check if iterate animation frame
    if(!this.dirty) {
      return
    }
    if (this.direction === true) {
      if(parseFloat(this.state.value) <= parseFloat(this.props.value)) {
        this.startAnimate();
      }
    }
    else if(this.direction === false){
      if (parseFloat(this.state.value) >= parseFloat(this.props.value)) {
        this.startAnimate();
      }
    }

  }

  render() {
    return (
      <Text {...this.props}>
        {this.state.displayValue}
      </Text>)
  }

  startAnimate() {

    let progress = this.getAnimationProgress()

    Timer.setTimeout(() => {

      let value = (this.endWith - this.startFrom)/this.props.steps
      if(this.props.countby)
        value = Math.sign(value)*Math.abs(this.props.countby)
      let total = parseFloat(this.state.value) + parseFloat(value)

      this.direction = (value > 0)
      // animation terminate conditions
      if (((this.direction) ^ (total <= this.endWith)) === 1) {
        this.dirty = false
        total = this.endWith
      }

      if(this.props.onProgress)
        this.props.onProgress(this.state.value, total)

      this.setState({
        value : total,
        displayValue : total
      })

    }, this.getTimingFunction(this.props.interval, progress))

  }

  getAnimationProgress():number {
    return (this.state.value - this.startFrom) / (this.endWith - this.startFrom)
  }

  getTimingFunction(interval:number, progress:number) {
    if(typeof this.props.timing === 'string') {
      let fn = AnimateNumber.TimingFunctions[this.props.timing]
      return fn(interval, progress)
    } else if(typeof this.props.timing === 'function')
      return this.props.timing(interval, progress)
    else
      return AnimateNumber.TimingFunctions['linear'](interval, progress)
  }

}
