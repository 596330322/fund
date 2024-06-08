import React from 'react';
import {Radio} from 'antd';

export default function Radios(props){
    return <Radio.Group value={props.radioValue} onChange={props.handleSizeChange}>
          <Radio.Button value="NOW">分时</Radio.Button>
          <Radio.Button value="DAY">日K</Radio.Button>
          <Radio.Button value="WEEK">周K</Radio.Button>
          <Radio.Button value="MONTH">月K</Radio.Button>
          <Radio.Button value="QUARTER">季K</Radio.Button>
          <Radio.Button value="YEAR">年K</Radio.Button>
        </Radio.Group>
}