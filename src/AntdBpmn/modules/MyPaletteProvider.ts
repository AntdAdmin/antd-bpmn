/**
 * 自定义工具栏
 */
import PaletteProvider from "bpmn-js/lib/features/palette/PaletteProvider";
import {getDi} from "bpmn-js/lib/util/ModelUtil";

type Palette = import('diagram-js/lib/features/palette/Palette').default;
type Create = import('diagram-js/lib/features/create/Create').default;
type ElementFactory = import('diagram-js/lib/core/ElementFactory').default & {
    createParticipantShape: () => any
};
type SpaceTool = import('bpmn-js/lib/features/space-tool/BpmnSpaceTool').default;
type LassoTool = import('diagram-js/lib/features/lasso-tool/LassoTool').default;
type HandTool = import('diagram-js/lib/features/hand-tool/HandTool').default;
type GlobalConnect = import('diagram-js/lib/features/global-connect/GlobalConnect').default;
export type Translate = typeof import("diagram-js/lib/i18n/translate/translate").default;
type PaletteEntries = import('diagram-js/lib/features/palette/Palette').PaletteEntries;

import {
    assign,
} from 'min-dash';

class MyPaletteProvider extends PaletteProvider {

    static $inject = [
        'palette',
        'create',
        'elementFactory',
        'spaceTool',
        'lassoTool',
        'handTool',
        'globalConnect',
        'translate'
    ];

    _palette: Palette;
    _create: Create;
    _elementFactory: ElementFactory;
    _spaceTool: SpaceTool;
    _lassoTool: LassoTool;
    _handTool: HandTool;
    _globalConnect: GlobalConnect;
    _translate: Translate;

    constructor(palette: Palette, create: Create, elementFactory: ElementFactory, spaceTool: SpaceTool, lassoTool: LassoTool
        , handTool: HandTool, globalConnect: GlobalConnect, translate: Translate) {
        super(palette, create, elementFactory, spaceTool, lassoTool, handTool, globalConnect, translate);

        this._palette = palette;
        this._create = create;
        this._elementFactory = elementFactory;
        this._spaceTool = spaceTool;
        this._lassoTool = lassoTool;
        this._handTool = handTool;
        this._globalConnect = globalConnect;
        this._translate = translate;
    }

    getPaletteEntries(): PaletteEntries {

        const actions = {},
            create = this._create,
            elementFactory = this._elementFactory,
            spaceTool = this._spaceTool,
            lassoTool = this._lassoTool,
            handTool = this._handTool,
            globalConnect = this._globalConnect,
            translate = this._translate;

        function createAction(type: string, group: string, className: string, title: string, options?: any) {

            function createListener(event: any) {
                const shape: any = elementFactory.createShape(assign({type: type}, options));

                if (options) {
                    const di = getDi(shape);
                    di.isExpanded = options.isExpanded;
                }

                create.start(event, shape, null);
            }

            const shortType = type.replace(/^bpmn:/, '');

            return {
                group: group,
                className: className,
                title: title || translate('Create {type}', {type: shortType}),
                action: {
                    dragstart: createListener,
                    click: createListener
                }
            };
        }

        function createSubprocess(event: any) {
            const subProcess = elementFactory.createShape({
                type: 'bpmn:SubProcess',
                x: 0,
                y: 0,
                isExpanded: true
            });

            const startEvent = elementFactory.createShape({
                type: 'bpmn:StartEvent',
                x: 40,
                y: 82,
                parent: subProcess
            });

            create.start(event, [subProcess, startEvent], {
                hints: {
                    autoSelect: [subProcess]
                }
            });
        }

        function createParticipant(event: any) {
            create.start(event, elementFactory.createParticipantShape(), null);
        }

        assign(actions, {
            'hand-tool': {
                group: 'tools',
                className: 'bpmn-icon-hand-tool',
                title: translate('Activate the hand tool'),
                action: {
                    click: function (event: any) {
                        handTool.activateHand(event, null, null);
                    }
                }
            },
            'lasso-tool': {
                group: 'tools',
                className: 'bpmn-icon-lasso-tool',
                title: translate('Activate the lasso tool'),
                action: {
                    click: function (event: any) {
                        lassoTool.activateSelection(event, null);
                    }
                }
            },
            'space-tool': {
                group: 'tools',
                className: 'bpmn-icon-space-tool',
                title: translate('Activate the create/remove space tool'),
                action: {
                    click: function (event: any) {
                        spaceTool.activateSelection(event, false, false);
                    }
                }
            },
            'global-connect-tool': {
                group: 'tools',
                className: 'bpmn-icon-connection-multi',
                title: translate('Activate the global connect tool'),
                action: {
                    click: function (event: any) {
                        globalConnect.start(event, null);
                    }
                }
            },
            'tool-separator': {
                group: 'tools',
                separator: true
            },
            'create.start-event': createAction(
                'bpmn:StartEvent', 'event', 'bpmn-icon-start-event-none',
                translate('Create StartEvent')
            ),
            'create.intermediate-event': createAction(
                'bpmn:IntermediateThrowEvent', 'event', 'bpmn-icon-intermediate-event-none',
                translate('Create Intermediate/Boundary Event')
            ),
            'create.end-event': createAction(
                'bpmn:EndEvent', 'event', 'bpmn-icon-end-event-none',
                translate('Create EndEvent')
            ),
            'create.exclusive-gateway': createAction(
                'bpmn:ExclusiveGateway', 'gateway', 'bpmn-icon-gateway-none',
                translate('Create Gateway')
            ),
            // 'create.task': createAction(
            //     'bpmn:Task', 'activity', 'bpmn-icon-task',
            //     translate('Create Task')
            // ),
            'create.user-task': createAction(
                'bpmn:UserTask', 'activity', 'bpmn-icon-user-task',
                translate('Create UserTask')
            ),

            'create.data-object': createAction(
                'bpmn:DataObjectReference', 'data-object', 'bpmn-icon-data-object',
                translate('Create DataObjectReference')
            ),
            'create.data-store': createAction(
                'bpmn:DataStoreReference', 'data-store', 'bpmn-icon-data-store',
                translate('Create DataStoreReference')
            ),
            'create.subprocess-expanded': {
                group: 'activity',
                className: 'bpmn-icon-subprocess-expanded',
                title: translate('Create expanded SubProcess'),
                action: {
                    dragstart: createSubprocess,
                    click: createSubprocess
                }
            },
            'create.participant-expanded': {
                group: 'collaboration',
                className: 'bpmn-icon-participant',
                title: translate('Create Pool/Participant'),
                action: {
                    dragstart: createParticipant,
                    click: createParticipant
                }
            },
            'create.group': createAction(
                'bpmn:Group', 'artifact', 'bpmn-icon-group',
                translate('Create Group')
            ),
        });
        return actions;
    }
}

export const myPalette = {
    paletteProvider: ["type", MyPaletteProvider]
};