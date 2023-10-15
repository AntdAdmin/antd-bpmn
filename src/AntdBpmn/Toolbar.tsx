import {Button, Modal, Space, Tooltip} from "antd";
import BpmnModeler from "bpmn-js/lib/Modeler";
import {MutableRefObject, useEffect, useRef, useState} from "react";
import TextArea from "antd/es/input/TextArea";
import {useSaveHotKeyFunction} from "./Hooks";

const Toolbar: React.FC<{
    modeler: BpmnModeler,
}> = ({modeler}) => {

    const currentZoomValueRef = useRef<number>(1);
    const selectItemsRef: MutableRefObject<Array<any> | undefined> = useRef();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [shortcutKeysOpen, setShortcutKeysOpen] = useState(false);
    const [previewXml, setPreviewXml] = useState<string>('');

    useEffect(() => {
        if (modeler){
            const eventBus: any = modeler.get('eventBus');
            const listener = (e: { newSelection: Array<any> }) => {
                selectItemsRef.current = e.newSelection
            }
            eventBus.on('selection.changed', listener)
            return () => {
                eventBus.off('selection.changed',listener);
            }
        }
    }, [])



    /**
     * 对齐方式
     * @param type left|right|center|top|bottom|middle
     */
    function align(type: "left" | "right" | "center" | "top" | "bottom" | "middle") {
        if (selectItemsRef.current && selectItemsRef.current.length > 1) {
            (modeler.get("alignElements") as any).trigger(selectItemsRef.current, type);
        } else {
            alert('需要选择 2 个以上的对象，才能进行对齐操作。')
        }
    }


    /**
     * 放大
     */
    function zoomIn() {
        currentZoomValueRef.current += 0.05;
        (modeler.get("canvas") as any).zoom(currentZoomValueRef.current, "auto")
    }

    /**
     * 缩小
     */
    function zoomOut() {
        currentZoomValueRef.current -= 0.05;
        (modeler.get("canvas") as any).zoom(currentZoomValueRef.current, "auto")
    }

    /**
     * 撤销
     */
    function undo() {
        (modeler.get("commandStack") as any).undo()
    }

    /**
     * 重做
     */
    function redo() {
        (modeler.get("commandStack") as any).redo()
    }

    async function xmlPreview() {
        const result = await modeler.saveXML({format: true});
        setPreviewXml(result.xml as string);
        setIsModalOpen(true);
    }

    async function xmlSave() {
        const xmlResult = await  modeler.saveXML({format: true});
        const svgResult = await  modeler.saveSVG();
        const processKey =  (modeler.get("canvas") as any).getRootElement().id;

        const content = {
            xmlContent: xmlResult.xml,
            svgContent: svgResult.svg,
            processKey: processKey,
        };

       console.log("saveContent: ",content)
    }

    useSaveHotKeyFunction(xmlSave);

    return (
        <>
            <Modal title="XML 预览" open={isModalOpen}
                   width={"80%"}
                   footer={
                       [
                           <Button type={"primary"} key="back" onClick={() => setIsModalOpen(false)}>
                               好的
                           </Button>,
                       ]
                   }
                   onCancel={() => setIsModalOpen(false)}>
                <TextArea rows={30} value={previewXml} spellCheck={false}/>
            </Modal>


            <Modal title="快捷键" open={shortcutKeysOpen}
                   width={"40%"}
                   footer={
                       [
                           <Button type={"primary"} key="back" onClick={() => setShortcutKeysOpen(false)}>
                               好的
                           </Button>,
                       ]
                   }
                   onCancel={() => setShortcutKeysOpen(false)}>
                <ul>
                    <li>撤销：⌘ (Ctrl) + Z</li>
                    <li>重做：⌘ (Ctrl) + ⇧ (Shift) + Z</li>
                    <li>全选：⌘ (Ctrl) + A</li>
                    <li>删除：Delete (删除键)</li>
                    <li>编辑文字：E</li>
                    <li>抓手工具：H</li>
                    <li>套索工具：L</li>
                    <li>空间工具：S</li>
                </ul>
            </Modal>


            <Space>
                <Button type="primary" onClick={xmlSave}>保存（Ctrl+s）</Button>
                <Button type="default" onClick={xmlPreview}> XML 预览</Button>
                <Space.Compact block>
                    <Tooltip title="向左对齐">
                        <Button style={{padding: "5px 0 0", width: "40px"}} onClick={() => align("left")} icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                 className="bi bi-align-start" viewBox="0 0 16 16">
                                <path fillRule="evenodd"
                                      d="M1.5 1a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-1 0v-13a.5.5 0 0 1 .5-.5z"></path>
                                <path
                                    d="M3 7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z"></path>
                            </svg>
                        }/>
                    </Tooltip>
                    <Tooltip title="左右居中">
                        <Button style={{padding: "5px 0 0", width: "40px"}} onClick={() => align("center")} icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                 className="bi bi-align-center" viewBox="0 0 16 16">
                                <path
                                    d="M8 1a.5.5 0 0 1 .5.5V6h-1V1.5A.5.5 0 0 1 8 1zm0 14a.5.5 0 0 1-.5-.5V10h1v4.5a.5.5 0 0 1-.5.5zM2 7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7z"></path>
                            </svg>
                        }/>
                    </Tooltip>
                    <Tooltip title="向右对齐">
                        <Button style={{padding: "5px 0 0", width: "40px"}} onClick={() => align("right")} icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                 className="bi bi-align-end" viewBox="0 0 16 16">
                                <path fillRule="evenodd"
                                      d="M14.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 1 0v-13a.5.5 0 0 0-.5-.5z"></path>
                                <path
                                    d="M13 7a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z"></path>
                            </svg>
                        }/>
                    </Tooltip>
                </Space.Compact>
                <Space.Compact block>
                    <Tooltip title="下上对齐">
                        <Button style={{padding: "5px 0 0", width: "40px"}} onClick={() => align("top")} icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                 className="bi bi-align-top" viewBox="0 0 16 16">
                                <rect width="4" height="12" rx="1" transform="matrix(1 0 0 -1 6 15)"></rect>
                                <path d="M1.5 2a.5.5 0 0 1 0-1v1zm13-1a.5.5 0 0 1 0 1V1zm-13 0h13v1h-13V1z"></path>
                            </svg>
                        }/>
                    </Tooltip>
                    <Tooltip title="上下居中">
                        <Button style={{padding: "5px 0 0", width: "40px"}} onClick={() => align("middle")} icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                 className="bi bi-align-middle" viewBox="0 0 16 16">
                                <path
                                    d="M6 13a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v10zM1 8a.5.5 0 0 0 .5.5H6v-1H1.5A.5.5 0 0 0 1 8zm14 0a.5.5 0 0 1-.5.5H10v-1h4.5a.5.5 0 0 1 .5.5z"></path>
                            </svg>
                        }/>
                    </Tooltip>
                    <Tooltip title="向下对齐">
                        <Button style={{padding: "5px 0 0", width: "40px"}} onClick={() => align("bottom")} icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                 className="bi bi-align-bottom" viewBox="0 0 16 16">
                                <rect width="4" height="12" x="6" y="1" rx="1"></rect>
                                <path
                                    d="M1.5 14a.5.5 0 0 0 0 1v-1zm13 1a.5.5 0 0 0 0-1v1zm-13 0h13v-1h-13v1z"></path>
                            </svg>
                        }/>
                    </Tooltip>
                </Space.Compact>
                <Space.Compact block>
                    <Tooltip title="放大">
                        <Button style={{padding: "5px 0 0", width: "40px"}} onClick={zoomIn} icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                 className="bi bi-zoom-in" viewBox="0 0 16 16">
                                <path fillRule="evenodd"
                                      d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/>
                                <path
                                    d="M10.344 11.742c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1 6.538 6.538 0 0 1-1.398 1.4z"/>
                                <path fillRule="evenodd"
                                      d="M6.5 3a.5.5 0 0 1 .5.5V6h2.5a.5.5 0 0 1 0 1H7v2.5a.5.5 0 0 1-1 0V7H3.5a.5.5 0 0 1 0-1H6V3.5a.5.5 0 0 1 .5-.5z"/>
                            </svg>
                        }/>
                    </Tooltip>
                    <Tooltip title="缩小">
                        <Button style={{padding: "5px 0 0", width: "40px"}} onClick={zoomOut} icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                 className="bi bi-zoom-out" viewBox="0 0 16 16">
                                <path fillRule="evenodd"
                                      d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/>
                                <path
                                    d="M10.344 11.742c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1 6.538 6.538 0 0 1-1.398 1.4z"/>
                                <path fillRule="evenodd"
                                      d="M3 6.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/>
                            </svg>
                        }/>
                    </Tooltip>
                </Space.Compact>
                <Space.Compact block>
                    <Tooltip title="重做">
                        <Button style={{padding: "5px 0 0", width: "40px"}} onClick={redo} icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                 className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                                <path fillRule="evenodd"
                                      d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                                <path
                                    d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                            </svg>
                        }/>
                    </Tooltip>
                    <Tooltip title="撤销">
                        <Button style={{padding: "5px 0 0", width: "40px"}} onClick={undo} icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                 className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
                                <path fillRule="evenodd"
                                      d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
                                <path
                                    d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
                            </svg>
                        }/>
                    </Tooltip>
                </Space.Compact>

                <Tooltip title="快捷键">
                    <Button style={{padding: "5px 0 0", width: "40px"}} onClick={() => setShortcutKeysOpen(true)} icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                             className="bi bi-keyboard" viewBox="0 0 16 16">
                            <path
                                d="M14 5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h12zM2 4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H2z"/>
                            <path
                                d="M13 10.25a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-.5zm0-2a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-.5zm-5 0A.25.25 0 0 1 8.25 8h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5A.25.25 0 0 1 8 8.75v-.5zm2 0a.25.25 0 0 1 .25-.25h1.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-1.5a.25.25 0 0 1-.25-.25v-.5zm1 2a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-.5zm-5-2A.25.25 0 0 1 6.25 8h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5A.25.25 0 0 1 6 8.75v-.5zm-2 0A.25.25 0 0 1 4.25 8h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5A.25.25 0 0 1 4 8.75v-.5zm-2 0A.25.25 0 0 1 2.25 8h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5A.25.25 0 0 1 2 8.75v-.5zm11-2a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-.5zm-2 0a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-.5zm-2 0A.25.25 0 0 1 9.25 6h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5A.25.25 0 0 1 9 6.75v-.5zm-2 0A.25.25 0 0 1 7.25 6h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5A.25.25 0 0 1 7 6.75v-.5zm-2 0A.25.25 0 0 1 5.25 6h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5A.25.25 0 0 1 5 6.75v-.5zm-3 0A.25.25 0 0 1 2.25 6h1.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-1.5A.25.25 0 0 1 2 6.75v-.5zm0 4a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-.5zm2 0a.25.25 0 0 1 .25-.25h5.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-5.5a.25.25 0 0 1-.25-.25v-.5z"/>
                        </svg>
                    }/>
                </Tooltip>

            </Space>
        </>
    );

}

export default Toolbar
