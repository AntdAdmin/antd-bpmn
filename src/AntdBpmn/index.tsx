import {useEffect, useRef, useState} from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import styles from "./antdbpmn.module.scss";

import {Col, Row} from "antd";
import Toolbar from "./Toolbar";
import PropertiesPanel, {Element} from "./PropertiesPanel";
import {zhTranslateModule} from "./modules/ZhTranslateModule";

function AntdBpmn() {

    const [xml, setXml] = useState<string | null>(null);
    const containerRef = useRef(null);


    const [defaultElement, setDefaultElement] = useState<Element>();
    const [modeler, setModeler] = useState<BpmnModeler | null>(null);


    useEffect(() => {
        if (!!xml && containerRef.current) {
            const bm = new BpmnModeler({
                container: containerRef.current,
                additionalModules: [zhTranslateModule],
                keyboard: {
                    bindTo: document
                }
            });

            bm.on("import.done", () => {
                const canvas: any = bm.get('canvas');
                canvas.zoom('fit-viewport');
                const el = canvas.getRootElement();
                setDefaultElement(el);
            });

            bm.importXML(xml).then(() => {
                console.log("import xml success!")
            }).catch(err => console.log("import xml error: ", err))

            setModeler(bm);

            return () => {
                bm && bm.destroy();
            };
        }
    }, [xml]);


    if (!xml) {
        // fetch("https://raw.githubusercontent.com/bpmn-io/react-bpmn/main/example/public/diagram.bpmn")
        fetch("bpmn.demo.xml")
            .then(response => response.text())
            .then(text => setXml(text))
            .catch(err => console.log(err));
    }

    return (
        <Row>
            <Col span={18} style={{height: "600px"}}>
                <div className={styles.toolbar}>
                    {modeler && <Toolbar modeler={modeler}/>}
                </div>
                <div id={"container"} className={styles.container} ref={containerRef}
                     style={{width: "100%", height: "100%"}}/>
            </Col>
            <Col span={6}>
                {modeler && <PropertiesPanel modeler={modeler} defaultElement={defaultElement!}/>}
            </Col>
        </Row>
    );

}

export default AntdBpmn
