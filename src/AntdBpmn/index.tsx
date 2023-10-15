import {MutableRefObject, useEffect, useRef, useState} from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import styles from "./antdbpmn.module.scss";

import {Col, Row, Form, Input, Checkbox, Select} from "antd";
import Toolbar from "./Toolbar";
import {UserAddOutlined} from "@ant-design/icons";

function AntdBmpn() {

    const [xml, setXml] = useState<string | null>(null);
    const containerRef = useRef(null);

    const modelerRef: MutableRefObject<BpmnModeler | undefined> = useRef();

    useEffect(() => {
        modelerRef.current = new BpmnModeler({
            container: containerRef.current!
        });

        if (xml) {
            modelerRef.current.importXML(xml)
        } else {
            // fetch("https://raw.githubusercontent.com/bpmn-io/react-bpmn/main/example/public/diagram.bpmn")
            fetch("bpmn.demo.xml")
                .then(response => response.text())
                .then(text => setXml(text))
                .catch(err => console.log(err));
        }

        modelerRef.current.on("import.done", () => {
            (modelerRef.current!.get('canvas') as any).zoom('fit-viewport');
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.modeler = modelerRef.current;

        return () => {
            modelerRef.current && modelerRef.current.destroy();
        };
    }, [xml]);


    return (
        <Row>
            <Col span={18} style={{height: "600px"}}>
                <div className={styles.toolbar}>
                    <Toolbar modeler={modelerRef as MutableRefObject<BpmnModeler>}/>
                </div>
                <div id={"container"} className={styles.container} ref={containerRef}
                     style={{width: "100%", height: "100%"}}/>
            </Col>
            <Col span={6}>
                <div className={styles.toolbar}>
                    当前对象：
                </div>
                <div style={{height: "600px", border: "1px solid #eee", padding: "10px"}}>
                    <Form.Item
                        label="ID"
                        name="username"
                        labelCol={{span: 4}}
                        rules={[{required: true, message: 'Please input your username!'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="名称"
                        name="username"
                        labelCol={{span: 4}}
                        rules={[{message: 'Please input your username!'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item name="checkbox-group" label="操作" labelCol={{span: 4}} wrapperCol={{span: 20}}>
                        <Checkbox.Group>
                            <Row>
                                <Col span={6}>
                                    <Checkbox value="A">
                                        同意
                                    </Checkbox>
                                </Col>
                                <Col span={6}>
                                    <Checkbox value="B" disabled>
                                        拒绝
                                    </Checkbox>
                                </Col>
                                <Col span={6}>
                                    <Checkbox value="C">
                                        驳回
                                    </Checkbox>
                                </Col>
                                <Col span={6}>
                                    <Checkbox value="D">
                                        停止
                                    </Checkbox>
                                </Col>
                                <Col span={6}>
                                    <Checkbox value="E">
                                        转办
                                    </Checkbox>
                                </Col>
                            </Row>
                        </Checkbox.Group>
                    </Form.Item>

                    <Form.Item
                        label="人员"
                        name="username"
                        labelCol={{span: 4}}
                        rules={[{message: 'Please input your username!'}]}
                    >
                        <Input addonAfter={<UserAddOutlined/>} defaultValue="张三"/>
                    </Form.Item>

                    <Form.Item
                        label="部门"
                        name="username"
                        labelCol={{span: 4}}
                        rules={[{message: 'Please input your username!'}]}
                    >
                        <Select placeholder="请选择部门" allowClear>
                            <Select.Option value="china">China</Select.Option>
                            <Select.Option value="usa">U.S.A</Select.Option>
                        </Select>
                    </Form.Item>

                </div>
            </Col>
        </Row>
    );

}

export default AntdBmpn
