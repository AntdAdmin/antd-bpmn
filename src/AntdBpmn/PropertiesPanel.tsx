import styles from "./antdbpmn.module.scss";
import {Col, Row, Input} from "antd";
import {useEffect, useRef, useState} from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";

export type ModdleElement = {
    id: string,
    $type: string,

    bounds: ModdleElement,

    $attrs: any,
    $parent: ModdleElement,
    bpmnElement: ModdleElement
}
export type Element = {
    id: string,
    type: string,
    width: number,
    height: number,
    isFrame: boolean,
    collapsed: boolean,
    x: number,
    y: number,
    di: ModdleElement,
    businessObject: {
        id: string,
        name: string,
        $type: string,
        isExecutable: boolean,
        $attrs: any,
        $parent: Element
    },
    children: Element[],
}

const PropertiesPanel: React.FC<{
    modeler: BpmnModeler,
    defaultElement: Element
}> = ({modeler, defaultElement}) => {


    const [currentElement, setCurrentElement] = useState<Element>(defaultElement);
    const [id, setId] = useState<string>(currentElement?.businessObject.id);
    const [name, setName] = useState<string>(currentElement?.businessObject.name);

    const businessObjectRef = useRef<Element["businessObject"]>()


    useEffect(() => {
        const eventBus: any = modeler.get('eventBus');
        const listener = (e: { element: Element }) => {
            console.log("element.click", e)

            setCurrentElement(e.element)
            businessObjectRef.current = e.element.businessObject;

            setId(e.element.businessObject.id)
            setName(e.element.businessObject.name)
        }
        eventBus.on('element.click', listener)

        return () => {
            eventBus.off('element.click', listener);
        }
    }, [])


    useEffect(() => {
        if (businessObjectRef.current && currentElement) {
            const modeling: any = modeler.get('modeling');
            modeling.updateProperties(currentElement, {name: name});
        }
    }, [name])


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
                        Name：
                    </Col>
                    <Col span={20}>
                        <Input value={name} onChange={(e) => setName(e.target.value)}/>
                    </Col>
                </Row>

            </div>
        </>
    );

}

export default PropertiesPanel
