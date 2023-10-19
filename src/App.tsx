import AntdBpmn, {AntdBpmnConfig} from "./AntdBpmn";

function App() {
    const antdConfig: AntdBpmnConfig = {
        deptDataUrl: "/xxxx",
        onLoad: (url, set) => {
            console.log("onLoad", url)
            set([
                {value: 'dept1', label: '北京分公司'},
                {value: 'dept2', label: '上海分公司'},
                {value: 'dept3', label: '-- 上海研发部'},
            ])
        },

        onChooseAssignee: (set) => {
            set(Math.random(), "Michael");
        },
    };
    return <AntdBpmn config={antdConfig}/>;
}

export default App
