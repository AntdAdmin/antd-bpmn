import AntdBpmn, {AntdBpmnConfig} from "./AntdBpmn";

function App() {
    const antdConfig: AntdBpmnConfig = {
        deptDataUrl: "/xxxx",
        xmlDataUrl: "bpmn.demo.xml",
        onLoad: (url, set) => {
            console.log("onLoad", url)
            // 加载 xml 数据
            if (url === "bpmn.demo.xml") {
                fetch(url).then(response => set(response.text()))
                    .catch(err => console.log(err));
            }
            // 加载部门数据
            else {
                set([
                    {value: 'dept1', label: '北京分公司'},
                    {value: 'dept2', label: '上海分公司'},
                    {value: 'dept3', label: '-- 上海研发部'},
                ])
            }
        },

        onChooseAssignee: (set) => {
            set(Math.random(), "Michael");
        },
    };
    return <AntdBpmn config={antdConfig}/>;
}

export default App
