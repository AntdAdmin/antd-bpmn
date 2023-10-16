import styles from "./antdbpmn.module.scss";
import {Col, Row, Input, Checkbox, Select} from "antd";
import {useEffect, useRef, useState} from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import {UserAddOutlined} from "@ant-design/icons";

type EventBus = import('diagram-js/lib/core/EventBus').default;
type Modeling = import('bpmn-js/lib/features/modeling/Modeling').default;
type Element = import('bpmn-js/lib/model/Types').Element;
// export type ModdleElement = {
//     id: string,
//     $type: string,
//
//     bounds: ModdleElement,
//
//     $attrs: any,
//     $parent: ModdleElement,
//     bpmnElement: ModdleElement
// }
// export type Element = {
//     id: string,
//     type: string,
//     width: number,
//     height: number,
//     isFrame: boolean,
//     collapsed: boolean,
//     x: number,
//     y: number,
//     di: ModdleElement,
//     businessObject: {
//         id: string,
//         name: string,
//         $type: string,
//         isExecutable: boolean,
//         $attrs: any,
//         $parent: Element
//     },
//     children: Element[],
// }

const PropertiesPanel: React.FC<{
    modeler: BpmnModeler,
    defaultElement: Element
}> = ({modeler, defaultElement}) => {

    const modeling: Modeling = modeler.get('modeling');

    const [currentElement, setCurrentElement] = useState<Element>(defaultElement);

    const [id, setId] = useState<string>(currentElement?.businessObject.id);
    const [name, setName] = useState<string>(currentElement?.businessObject.name);

    const [showUserProperties, setShowUserProperties] = useState<boolean>(false);

    const businessObjectRef = useRef<Element["businessObject"]>()

    const ignoreElementChanged = useRef(false);

    function changeCurrentElement(element:Element){
        setCurrentElement(element)
        businessObjectRef.current = element.businessObject;

        setId(element.businessObject.id)
        setName(element.businessObject.name)

        if (element.businessObject?.$type.endsWith("UserTask")) {
            setShowUserProperties(true);
        } else {
            setShowUserProperties(false);
        }
    }

    useEffect(() => {
        const eventBus: EventBus = modeler.get('eventBus');
        const clickListener = (e: { element: Element }) => {
            console.log("element.click", e.element)
            changeCurrentElement(e.element);
        }
        eventBus.on('element.click', clickListener)

        const changedListener = (e: { element: Element }) => {
            if (!ignoreElementChanged.current) {
                //忽略顺序流的修改
                if (!e.element.businessObject?.$type.endsWith("SequenceFlow")){
                    return;
                }
                changeCurrentElement(e.element);
            }
        }
        eventBus.on('element.changed', changedListener)
        return () => {
            eventBus.off('element.click', clickListener);
            eventBus.off('element.changed', changedListener);
        }
    }, [])


    function updateElementProperty(property: string, value: string) {
        if (businessObjectRef.current && currentElement) {
            try {
                ignoreElementChanged.current = true;
                modeling.updateProperties(currentElement, {[property]: value});
            } finally {
                ignoreElementChanged.current = false;
            }
        }
    }

    useEffect(() => {
        updateElementProperty("name", name);
    }, [name])


    useEffect(() => {
        updateElementProperty("id", id);
    }, [id])


    return (
        <>
            <div className={styles.toolbar}>
                当前对象：{currentElement?.businessObject?.$type}
            </div>
            <div style={{height: "600px", border: "1px solid #eee", padding: "10px"}}>

                <Row style={{margin: "10px 0"}}>
                    <Col span={4} style={{textAlign: "right", lineHeight: "30px"}}>
                        ID：
                    </Col>
                    <Col span={20}>
                        <Input value={id} onChange={(e) => setId(e.target.value)}/>
                    </Col>
                </Row>

                <Row style={{margin: "10px 0"}}>
                    <Col span={4} style={{textAlign: "right", lineHeight: "30px"}}>
                        名称：
                    </Col>
                    <Col span={20}>
                        <Input value={name} onChange={(e) => setName(e.target.value)}/>
                    </Col>
                </Row>


                {showUserProperties && <>
                    <Row style={{margin: "10px 0"}}>
                        <Col span={4} style={{textAlign: "right", lineHeight: "30px"}}>
                            操作：
                        </Col>
                        <Col span={20}>
                            <Checkbox.Group>
                                <Row>
                                    <Col span={8}>
                                        <Checkbox value="A" style={{lineHeight: '22px'}}>
                                            同意
                                        </Checkbox>
                                    </Col>
                                    <Col span={8}>
                                        <Checkbox value="B" style={{lineHeight: '22px'}} disabled>
                                            拒绝
                                        </Checkbox>
                                    </Col>
                                    <Col span={8}>
                                        <Checkbox value="C" style={{lineHeight: '22px'}}>
                                            驳回
                                        </Checkbox>
                                    </Col>

                                    <Col span={8}>
                                        <Checkbox value="E" style={{lineHeight: '22px'}}>
                                            转办
                                        </Checkbox>
                                    </Col>
                                    <Col span={8}>
                                        <Checkbox value="F" style={{lineHeight: '22px'}}>
                                            委派
                                        </Checkbox>
                                    </Col>
                                    <Col span={8}>
                                        <Checkbox value="D" style={{lineHeight: '22px'}}>
                                            终止
                                        </Checkbox>
                                    </Col>
                                    <Col span={8}>
                                        <Checkbox value="G" style={{lineHeight: '22px'}}>
                                            撤回
                                        </Checkbox>
                                    </Col>
                                    <Col span={8}>
                                        <Checkbox value="H" style={{lineHeight: '22px'}}>
                                            撤销
                                        </Checkbox>
                                    </Col>
                                </Row>
                            </Checkbox.Group>
                        </Col>
                    </Row>

                    <Row style={{margin: "10px 0"}}>
                        <Col span={4} style={{textAlign: "right", lineHeight: "30px"}}>
                            人员：
                        </Col>
                        <Col span={20}>
                            <Input addonAfter={<UserAddOutlined/>} defaultValue="张三"/>
                        </Col>
                    </Row>

                    <Row style={{margin: "10px 0"}}>
                        <Col span={4} style={{textAlign: "right", lineHeight: "30px"}}>
                            部门：
                        </Col>
                        <Col span={20}>
                            <Select placeholder="请选择部门" allowClear style={{width: "100%"}}>
                                <Select.Option value="china">China</Select.Option>
                                <Select.Option value="usa">U.S.A</Select.Option>
                            </Select>
                        </Col>
                    </Row>
                </>}
            </div>
        </>
    );

}

export default PropertiesPanel
