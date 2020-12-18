import React, { useState, useEffect } from 'react';
import 'antd/dist/antd.css';
import { Modal, Row, Col } from 'antd';
import './ColorModal.css';

function ColorModal({ colors, visible, onCancel, onColor }, props) { // visible, onCreate, onCancel 

    const [c1, setc1] = useState(colors[0]);
    const [c2, setc2] = useState(colors[1]);
    const [colorStyle, setColorStyle] = useState({
        backgroundImage: "linear-gradient(" + c1 + "," + c2 + ")",
        height: "150px",
        width: "150px",
        borderRadius: "50%",
    });

    useEffect(() => {
        setColorStyle({
            backgroundImage: "linear-gradient(" + c1 + "," + c2 + ")",
            height: "150px",
            width: "150px",
            borderRadius: "50%",
        });
    }, [c1, c2]);

    function resetColors() {
        setc1(colors[0]);
        setc2(colors[1]);
        onCancel();
    }

    return (
        <Modal
            visible={visible}
            title={"Choose Song Colors"}
            okText="OK"
            cancelText="Cancel"
            onCancel={() => resetColors()}
            onOk={() => onColor([c1, c2])}
            okButtonProps={{ style: { color: "black" } }}
        >
            <Row>
                <Col flex={2}>
                    <div className="color-gradient-preview-wrapper">
                        <Row justify="center">
                            <div className="color-gradient-preview" style={colorStyle}></div>
                        </Row>
                    </div>
                </Col>
                <Col flex={1}>
                    <div className="color-picker-container">
                        <Row gutter={[16, 104]}>
                            <Col>
                                <input type="color" id="color1" name="color1"
                                    value={c1}
                                    onChange={e => { setc1(e.target.value) }}>
                                </input>
                            </Col>
                            <Col>
                                <label for="color1">Top Color</label>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col>
                                <input type="color" id="color2" name="color2"
                                    value={c2}
                                    onChange={e => { setc2(e.target.value) }}>
                                </input>
                            </Col>
                            <Col>
                                <label for="color2">Bottom Color</label>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>

        </Modal >
    );
}

export default ColorModal;