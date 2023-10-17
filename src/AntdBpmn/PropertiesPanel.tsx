import styles from "./antdbpmn.module.scss";
import {Col, Row, Input, Checkbox, Select, Avatar, Button, Badge} from "antd";
import {useEffect, useRef, useState} from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import {PlusOutlined, UserAddOutlined, UserOutlined} from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import Text from "antd/es/typography/Text";
import TextArea from "antd/es/input/TextArea";
import Link from "antd/es/typography/Link";

type EventBus = import('diagram-js/lib/core/EventBus').default;
type Modeling = import('bpmn-js/lib/features/modeling/Modeling').default;
type BpmnFactory = import('bpmn-js/lib/features/modeling/BpmnFactory').default;
type Element = import('bpmn-js/lib/model/Types').Element & {
    businessObject: {
        id: string,
        name: string,
        //条件表达式
        conditionExpression?: {
            body: string,
        },
        //多实例变量
        loopCharacteristics?: {
            isSequential: boolean, // true:串行, false:并行
            loopCardinality: any,
            collection: any,
            elementVariable: any,
            completionCondition: any,
        },
        $type: string,
        $attrs: any,
    }
};

const PropertiesPanel: React.FC<{
    modeler: BpmnModeler,
    defaultElement: Element,
    attrPrefix?: string,
}> = ({modeler, defaultElement, attrPrefix = "flowable:"}) => {

    const modeling: Modeling = modeler.get('modeling');

    const [currentElement, setCurrentElement] = useState<Element>(defaultElement);

    const [id, setId] = useState<string>(currentElement?.businessObject.id);
    const [name, setName] = useState<string>(currentElement?.businessObject.name);
    const [conditionExpression, setConditionExpression] = useState<string>(currentElement?.businessObject.conditionExpression);
    const [actions, setActions] = useState<string[]>();

    const [showUserProperties, setShowUserProperties] = useState<boolean>(false);
    const [showMultiInstancesProperties, setShowMultiInstancesProperties] = useState<boolean>(false);
    const [showConditionExpression, setShowConditionExpression] = useState<boolean>(false);

    const businessObjectRef = useRef<Element["businessObject"]>()

    const ignoreElementChanged = useRef(false);

    function changeCurrentElement(element: Element) {
        console.log("changeCurrentElement: ", element)

        setCurrentElement(element)
        const businessObject = element.businessObject;
        businessObjectRef.current = businessObject;

        setId(businessObject.id)
        setName(businessObject.name)

        // 操作
        let actions = businessObject.$attrs[attrPrefix + "actions"];
        if (actions) {
            if (typeof actions === "string") {
                actions = actions.split(",");
            }
            setActions(actions as string[]);
        }else {
            setActions([]);
        }

        //是否显示用户相关的属性
        if (element.businessObject?.$type.endsWith("UserTask")) {
            setShowUserProperties(true);
        } else {
            setShowUserProperties(false);
        }

        //多实例，注意：StandardLoopCharacteristics 是循环实例
        if (element.businessObject.loopCharacteristics
            && element.businessObject.loopCharacteristics.$type != "bpmn:StandardLoopCharacteristics") {
            setShowMultiInstancesProperties(true)
        } else {
            setShowMultiInstancesProperties(false);
        }

        //条件表达式
        if (businessObject.$type.endsWith("SequenceFlow")) {
            setShowConditionExpression(true);
            setConditionExpression(businessObject.conditionExpression?.body)
        } else {
            setShowConditionExpression(false);
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
            console.log("changed: ", e)
            if (!ignoreElementChanged.current) {
                //忽略顺序流的修改
                if (e.element.businessObject?.$type.endsWith("SequenceFlow")) {
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


    function updateElementProperty(property: string, value: any, forBusinessObjectAttrs: boolean = false) {
        if (businessObjectRef.current && currentElement) {
            try {
                ignoreElementChanged.current = true;
                if (forBusinessObjectAttrs) {
                    currentElement.businessObject.$attrs[attrPrefix + property] = value;
                } else {
                    modeling.updateProperties(currentElement, {[property]: value});
                }
            } finally {
                ignoreElementChanged.current = false;
            }
        }
    }

    useEffect(() => {
        updateElementProperty("id", id);
    }, [id])


    useEffect(() => {
        updateElementProperty("name", name);
    }, [name])


    useEffect(() => {
        updateElementProperty("actions", actions, true);
    }, [actions])

    useEffect(() => {
        if (conditionExpression) {
            const bpmnFactory: BpmnFactory = modeler.get("bpmnFactory");
            const expression = bpmnFactory.create("bpmn:FormalExpression")
            expression.body = conditionExpression
            updateElementProperty("conditionExpression", expression);
        } else {
            updateElementProperty("conditionExpression", undefined);
        }
    }, [conditionExpression])


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


                {showConditionExpression &&
                    <Row style={{margin: "10px 0"}}>
                        <Col span={4} style={{textAlign: "right", lineHeight: "30px"}}>
                            条件：
                        </Col>
                        <Col span={20}>
                            <TextArea rows={2} value={conditionExpression}
                                      onChange={(e) => setConditionExpression(e.target.value)}/>
                            <Text type="secondary">流转条件表达式，请参考：
                                <Link onClick={() => {
                                    alert("here")
                                }}>
                                    这里
                                </Link>。
                            </Text>
                        </Col>
                    </Row>
                }


                {showUserProperties && <>
                    <Row style={{margin: "10px 0"}}>
                        <Col span={4} style={{textAlign: "right", lineHeight: "30px"}}>
                            操作：
                        </Col>
                        <Col span={20}>
                            <Checkbox.Group onChange={(e) => {
                                setActions(e as string[])
                            }} value={actions}>
                                <Row>
                                    <Col span={8}>
                                        <Checkbox value="agree" style={{lineHeight: '22px'}}>
                                            同意
                                        </Checkbox>
                                    </Col>
                                    <Col span={8}>
                                        <Checkbox value="refuse" style={{lineHeight: '22px'}} disabled>
                                            拒绝
                                        </Checkbox>
                                    </Col>
                                    <Col span={8}>
                                        <Checkbox value="rebut" style={{lineHeight: '22px'}}>
                                            驳回
                                        </Checkbox>
                                    </Col>
                                    <Col span={8}>
                                        <Checkbox value="transfer" style={{lineHeight: '22px'}}>
                                            转办
                                        </Checkbox>
                                    </Col>
                                    <Col span={8}>
                                        <Checkbox value="assign" style={{lineHeight: '22px'}}>
                                            委派
                                        </Checkbox>
                                    </Col>
                                    <Col span={8}>
                                        <Checkbox value="stop" style={{lineHeight: '22px'}}>
                                            终止
                                        </Checkbox>
                                    </Col>
                                    <Col span={8}>
                                        <Checkbox value="recall" style={{lineHeight: '22px'}}>
                                            撤回
                                        </Checkbox>
                                    </Col>
                                    <Col span={8}>
                                        <Checkbox value="retract" style={{lineHeight: '22px'}}>
                                            撤销
                                        </Checkbox>
                                    </Col>
                                </Row>
                            </Checkbox.Group>
                        </Col>
                    </Row>

                    {!showMultiInstancesProperties && <>
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
                </>}


                {showMultiInstancesProperties && <>
                    <div>
                        <Title level={5}>多实例
                            （{currentElement.businessObject.loopCharacteristics?.isSequential ? "串行" : "并行"}）</Title>
                    </div>

                    <Row style={{margin: "10px 0"}}>
                        <Col span={4} style={{textAlign: "right", lineHeight: "30px"}}>
                            人员：
                        </Col>
                        <Col span={20}>
                            <Row gutter={[4, 4]}>
                                <Col span={4}>
                                    <a onClick={() => {
                                        alert("xxx")
                                    }}>
                                        <Badge count={'-'} size={"small"}>
                                            <Avatar style={{backgroundColor: '#4c80e7'}} icon={<UserOutlined/>}/>
                                        </Badge>
                                    </a>
                                </Col>
                                <Col span={4}>
                                    <a onClick={() => {
                                        alert("xxx")
                                    }}>
                                        <Badge count={'-'} size={"small"}>
                                            <Avatar style={{backgroundColor: '#87d068'}} icon={<UserOutlined/>}/>
                                        </Badge>
                                    </a>
                                </Col>
                                <Col span={4}>
                                    <a onClick={() => {
                                        alert("xxx")
                                    }}>
                                        <Badge count={'-'} size={"small"}>
                                            <Avatar style={{backgroundColor: '#87d068'}} icon={<UserOutlined/>}/>
                                        </Badge>
                                    </a>
                                </Col>
                                <Col span={4}>
                                    <a onClick={() => {
                                        alert("xxx")
                                    }}>
                                        <Badge count={'-'} size={"small"}>
                                            <Avatar style={{backgroundColor: '#87d068'}} icon={<UserOutlined/>}/>
                                        </Badge>
                                    </a>
                                </Col>
                                <Col span={4}>
                                    <a onClick={() => {
                                        alert("xxx")
                                    }}>
                                        <Badge count={'-'} size={"small"}>
                                            <Avatar style={{backgroundColor: '#87d068'}} icon={<UserOutlined/>}/>
                                        </Badge>
                                    </a>
                                </Col>
                                <Col span={4}>
                                    <a onClick={() => {
                                        alert("xxx")
                                    }}>
                                        <Badge count={'-'} size={"small"}>
                                            <Avatar style={{backgroundColor: '#87d068'}} icon={<UserOutlined/>}/>
                                        </Badge>
                                    </a>
                                </Col>
                                <Col span={4}>
                                    <a onClick={() => {
                                        alert("xxx")
                                    }}>
                                        <Badge count={'-'} size={"small"}>
                                            <Avatar style={{backgroundColor: '#87d068'}} icon={<UserOutlined/>}/>
                                        </Badge>
                                    </a>
                                </Col>
                                <Col span={4}>
                                    <a onClick={() => {
                                        alert("xxx")
                                    }}>
                                        <Badge count={'-'} size={"small"}>
                                            <Avatar style={{backgroundColor: '#87d068'}} icon={<UserOutlined/>}/>
                                        </Badge>
                                    </a>
                                </Col>

                                <Col span={4}>
                                    <Button type="dashed" shape="circle" icon={<PlusOutlined/>}/>
                                </Col>

                            </Row>
                        </Col>
                    </Row>


                    <Row style={{margin: "10px 0"}}>
                        <Col span={4} style={{textAlign: "right", lineHeight: "30px"}}>
                            完成：
                        </Col>
                        <Col span={20}>
                            <TextArea rows={3} value={name} onChange={(e) => setName(e.target.value)}/>
                            <Text type="secondary">完成条件表达式，请参考：
                                <Link onClick={() => {
                                    alert("here")
                                }}>
                                    这里
                                </Link>。
                            </Text>
                        </Col>
                    </Row>

                </>}

            </div>
        </>
    );

}

export default PropertiesPanel
