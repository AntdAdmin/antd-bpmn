import {useEffect, useRef, useState} from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import styles from "./antdbpmn.module.scss";

import {Col, Row} from "antd";
import Toolbar from "./Toolbar";
import PropertiesPanel from "./PropertiesPanel";
import {zhTranslateModule} from "./modules/ZhTranslateModule";
import {myPalette} from "./modules/MyPaletteProvider";
import {myContextPad} from "./modules/MyContextPadProvider";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import minimapModule from 'diagram-js-minimap';
// 小地图
import "diagram-js-minimap/assets/diagram-js-minimap.css";

import {flowableDescriptor} from "./descriptors/flowableDescriptor";

type Element = import('bpmn-js/lib/model/Types').Element;

export type AntdBpmnConfig = {
    //加载数据
    onLoad: (url: string, set: (data: any) => void) => void,

    //现在用户触发器
    onChooseAssignee: (set: (id: any, nickName: string) => void) => void,

    //部门数据的 URL
    deptDataUrl?: string,

    //xml 加载 url
    xmlDataUrl?:string
}


const AntdBpmn: React.FC<{
    attrPrefix?: string,
    config: AntdBpmnConfig,
}> = ({attrPrefix = "flowable:", config}) => {


    const [xml, setXml] = useState<string | null>(null);
    const containerRef = useRef(null);


    const [defaultElement, setDefaultElement] = useState<Element>();
    const [modeler, setModeler] = useState<BpmnModeler | null>(null);


    useEffect(() => {
        if (!!xml && containerRef.current) {
            const bm = new BpmnModeler({
                container: containerRef.current,
                additionalModules: [zhTranslateModule, myPalette, myContextPad, minimapModule],
                moddleExtensions: {
                    flowable: flowableDescriptor,
                },
                keyboard: {
                    bindTo: document
                },
                bpmnRenderer: {
                    defaultLabelColor: "#000",
                    defaultFillColor: '#eef4ff',
                    defaultStrokeColor: '#349afa'
                },
                textRenderer: {
                    defaultStyle: {
                        fontFamily: '"Inter, system-ui, Avenir, Helvetica, Arial, sans-serif"',
                        // fontFamily: string;
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "20px",
                    }
                },
                // minimap:{
                //     open:true
                // },

            });

            bm.on("import.done", () => {
                const canvas: any = bm.get('canvas');
                canvas.zoom('fit-viewport', 'auto');
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

    useEffect(()=>{
        config.onLoad(config.xmlDataUrl!,setXml);
    },[])



    return (
        <Row>
            <Col span={18} style={{height: "600px"}}>
                <div className={styles.toolbar}>
                    {modeler && <Toolbar modeler={modeler}/>}
                </div>
                <div id={"container"} className={styles.container} ref={containerRef}
                     style={{width: "100%", height: "620px"}}/>
            </Col>
            <Col span={6}>
                {modeler && <PropertiesPanel attrPrefix={attrPrefix} config={config}
                                             modeler={modeler} defaultElement={defaultElement!}/>
                }
            </Col>
        </Row>
    );

}

export default AntdBpmn
