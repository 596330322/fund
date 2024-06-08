import React from 'react';
import { Col, Row,Modal,Table } from 'antd';
const { Column } = Table;

export default function Board(props) {
    const { pankouinfos,update,cur,modal,detailinfos,onClose } = props;
    // ...
    return (
        <div style={{height:360}}>
            <div>
                <h1 style={{color:cur?.increase > 0 ?'green':'red'}}>
                    <span>{cur?.price} {cur?.unit} &emsp;{cur?.increase} &emsp;{cur?.ratio}</span>
                </h1>
                <h4>
                    <span>{update?.stockStatus}</span>&emsp;<span>{update?.text}</span>&emsp;<span>{update?.timezone}</span>
                </h4>
            </div>
            <div style={{width:800}}>
                <h2>行情</h2>
                <Row>
                {
                    pankouinfos && pankouinfos.map((item,index)=>{
                        return (
                                <Col  key={index} span={6} style={{justifyContent:'space-between',display:'flex',paddingRight:20,paddingBottom:10}}><span>{item.name}</span><span style={{color:item.status ? item.status === 'up'?'green':'red':'#000'}}>{item.value}</span></Col>
                            )
                        })
                    }
                </Row>
            </div>
            <Modal
            open={modal}
            title="交易详情"
            width={1000}
            onCancel={onClose}
            footer={null}
            >
            <Table dataSource={detailinfos} pagination={false} scroll={{y:500}}>
                <Column title="时间" dataIndex="formatTime" key="formatTime"/>
                <Column title="价格" dataIndex="price" key="price"/>
                <Column title="成交量" dataIndex="volume" key="volume" />
                <Column title="类型" dataIndex="bsFlag" key="bsFlag"
                render={(text)=>{return text === 'B' ? <span style={{color:'green'}}>B</span> : <span style={{color:'red'}}>S</span>}}/>
            </Table>
            </Modal>
            <br />
            <br />
        </div>
    )
}
