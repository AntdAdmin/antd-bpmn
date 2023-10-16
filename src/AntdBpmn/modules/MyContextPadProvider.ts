/**
 * 自定义菜单，主要修改 Task 为 UserTask
 */
import { is} from "bpmn-js/lib/util/ModelUtil";
import {
    hasPrimaryModifier
} from 'diagram-js/lib/util/Mouse';
import ContextPadProvider, {ContextPadConfig} from "bpmn-js/lib/features/context-pad/ContextPadProvider";
import {isAny} from "bpmn-js/lib/features/modeling/util/ModelingUtil";
import {isEventSubProcess, isExpanded} from "bpmn-js/lib/util/DiUtil";
import {getChildLanes} from "bpmn-js/lib/features/modeling/util/LaneUtil";

type Injector = import('didi').Injector;
type EventBus = import('diagram-js/lib/core/EventBus').default;
type ContextPad = import('diagram-js/lib/features/context-pad/ContextPad').default;
type Modeling = import('bpmn-js/lib/features/modeling/Modeling').default;
type ElementFactory = import('bpmn-js/lib/features/modeling/ElementFactory').default;
type Connect = import('diagram-js/lib/features/connect/Connect').default;
type Create = import('diagram-js/lib/features/create/Create').default;
type PopupMenu = import('diagram-js/lib/features/popup-menu/PopupMenu').default;
type Rules = import('diagram-js/lib/features/rules/Rules').default;
export type Translate = typeof import("diagram-js/lib/i18n/translate/translate").default;
type Element = import('bpmn-js/lib/model/Types').Element;
type ContextPadEntries = import('diagram-js/lib/features/context-pad/ContextPadProvider').ContextPadEntries;

import {
    assign,
    forEach,
    isArray,
} from 'min-dash';



class MyContextPadProvider extends ContextPadProvider {
    static $inject = [
        'config',
        'injector',
        'eventBus',
        'contextPad',
        'modeling',
        'elementFactory',
        'connect',
        'create',
        'popupMenu',
        'canvas',
        'rules',
        'translate'
    ];

    _config: ContextPadConfig;
    _injector: Injector;
    _eventBus: EventBus;
    _contextPad: ContextPad;
    _modeling: Modeling;
    _elementFactory: ElementFactory;
    _connect: Connect;
    _create: Create;
    _popupMenu: PopupMenu;
    _canvas: any;
    _rules: Rules;
    _translate: Translate;
    _autoPlace:any;

    constructor(config: ContextPadConfig, injector: Injector, eventBus: EventBus, contextPad: ContextPad, modeling: Modeling, elementFactory: ElementFactory,
                connect: Connect, create: Create, popupMenu: PopupMenu, canvas: any, rules: Rules, translate: Translate){
        super(config, injector, eventBus, contextPad, modeling, elementFactory, connect, create, popupMenu, canvas, rules, translate);

        this._config = config;
        this._injector = injector;
        this._eventBus = eventBus;
        this._contextPad = contextPad;
        this._modeling = modeling;
        this._elementFactory = elementFactory;
        this._connect = connect;
        this._create = create;
        this._popupMenu = popupMenu;
        this._canvas = canvas;
        this._rules = rules;
        this._translate = translate;

        if (config.autoPlace !== false) {
            this._autoPlace = injector.get('autoPlace', false);
        }

        eventBus.on('create.end', 250, function (event:any) {
            const context = event.context,
                shape = context.shape;

            if (!hasPrimaryModifier(event) || !contextPad.isOpen(shape)) {
                return;
            }

            const entries = contextPad.getEntries(shape);

            if (entries.replace) {
                (entries.replace.action as any).click(event, shape);
            }
        });

    }


     isEventType(businessObject:any, type:any, eventDefinitionType:any):boolean{

        const isType = businessObject.$instanceOf(type);
         let isDefinition = false;

         const definitions = businessObject.eventDefinitions || [];
        forEach(definitions, function(def:any) {
            if (def.$type === eventDefinitionType) {
                isDefinition = true;
            }
        });

        return isType && isDefinition;
    }


    getContextPadEntries(element: Element): ContextPadEntries {
        // return super.getContextPadEntries(element);

        const contextPad = this._contextPad,
            modeling = this._modeling,

            elementFactory = this._elementFactory,
            connect = this._connect,
            create = this._create,
            popupMenu = this._popupMenu,
            rules = this._rules,
            autoPlace = this._autoPlace,
            translate = this._translate;

        const actions = {};

        if (element.type === 'label') {
            return actions;
        }

        const businessObject = element.businessObject;

        function startConnect(event:any, element:Element) {
            connect.start(event, element);
        }

        function removeElement(_:any, element:Element) {
            modeling.removeElements([ element ]);
        }

        function getReplaceMenuPosition(element:Element) {

            const Y_OFFSET = 5;

            const pad = contextPad.getPad(element).html as any;

            const padRect = pad.getBoundingClientRect();

            const pos = {
                x: padRect.left,
                y: padRect.bottom + Y_OFFSET
            };

            return pos;
        }

        /**
         * Create an append action.
         *
         * @param {string} type
         * @param {string} className
         * @param {string} [title]
         * @param {Object} [options]
         *
         * @return {ContextPadEntry}
         */
        function appendAction(type:string, className:string, title:any, options?:any) {

            if (typeof title !== 'string') {
                options = title;
                title = translate('Append {type}', { type: type.replace(/^bpmn:/, '') });
            }

            function appendStart(event:any, element:Element) {

                const shape = elementFactory.createShape(assign({ type: type }, options));
                create.start(event, shape, {
                    source: element
                });
            }


            const append = autoPlace ? function(_:any, element:Element) {
                const shape = elementFactory.createShape(assign({ type: type }, options));
                autoPlace.append(element, shape);
            } : appendStart;


            return {
                group: 'model',
                className: className,
                title: title,
                action: {
                    dragstart: appendStart,
                    click: append
                }
            };
        }

        function splitLaneHandler(count:number) {

            return function(_:any, element:any) {

                // actual split
                modeling.splitLane(element, count);

                // refresh context pad after split to
                // get rid of split icons
                contextPad.open(element, true);
            };
        }


        if (isAny(businessObject, [ 'bpmn:Lane', 'bpmn:Participant' ]) && isExpanded(element)) {

            const childLanes = getChildLanes(element as any);

            assign(actions, {
                'lane-insert-above': {
                    group: 'lane-insert-above',
                    className: 'bpmn-icon-lane-insert-above',
                    title: translate('Add Lane above'),
                    action: {
                        click: function(_:any, element:any) {
                            modeling.addLane(element, 'top');
                        }
                    }
                }
            });

            if (childLanes.length < 2) {

                if (element.height >= 120) {
                    assign(actions, {
                        'lane-divide-two': {
                            group: 'lane-divide',
                            className: 'bpmn-icon-lane-divide-two',
                            title: translate('Divide into two Lanes'),
                            action: {
                                click: splitLaneHandler(2)
                            }
                        }
                    });
                }

                if (element.height >= 180) {
                    assign(actions, {
                        'lane-divide-three': {
                            group: 'lane-divide',
                            className: 'bpmn-icon-lane-divide-three',
                            title: translate('Divide into three Lanes'),
                            action: {
                                click: splitLaneHandler(3)
                            }
                        }
                    });
                }
            }

            assign(actions, {
                'lane-insert-below': {
                    group: 'lane-insert-below',
                    className: 'bpmn-icon-lane-insert-below',
                    title: translate('Add Lane below'),
                    action: {
                        click: function(_:any, element:any) {
                            modeling.addLane(element, 'bottom');
                        }
                    }
                }
            });

        }

        if (is(businessObject, 'bpmn:FlowNode')) {

            if (is(businessObject, 'bpmn:EventBasedGateway')) {

                assign(actions, {
                    'append.receive-task': appendAction(
                        'bpmn:ReceiveTask',
                        'bpmn-icon-receive-task',
                        translate('Append ReceiveTask')
                    ),
                    'append.message-intermediate-event': appendAction(
                        'bpmn:IntermediateCatchEvent',
                        'bpmn-icon-intermediate-event-catch-message',
                        translate('Append MessageIntermediateCatchEvent'),
                        { eventDefinitionType: 'bpmn:MessageEventDefinition' }
                    ),
                    'append.timer-intermediate-event': appendAction(
                        'bpmn:IntermediateCatchEvent',
                        'bpmn-icon-intermediate-event-catch-timer',
                        translate('Append TimerIntermediateCatchEvent'),
                        { eventDefinitionType: 'bpmn:TimerEventDefinition' }
                    ),
                    'append.condition-intermediate-event': appendAction(
                        'bpmn:IntermediateCatchEvent',
                        'bpmn-icon-intermediate-event-catch-condition',
                        translate('Append ConditionIntermediateCatchEvent'),
                        { eventDefinitionType: 'bpmn:ConditionalEventDefinition' }
                    ),
                    'append.signal-intermediate-event': appendAction(
                        'bpmn:IntermediateCatchEvent',
                        'bpmn-icon-intermediate-event-catch-signal',
                        translate('Append SignalIntermediateCatchEvent'),
                        { eventDefinitionType: 'bpmn:SignalEventDefinition' }
                    )
                });
            } else

            if (this.isEventType(businessObject, 'bpmn:BoundaryEvent', 'bpmn:CompensateEventDefinition')) {

                assign(actions, {
                    'append.compensation-activity':
                        appendAction(
                            'bpmn:Task',
                            'bpmn-icon-task',
                            translate('Append compensation activity'),
                            {
                                isForCompensation: true
                            }
                        )
                });
            } else

            if (!is(businessObject, 'bpmn:EndEvent') &&
                !businessObject.isForCompensation &&
                !this.isEventType(businessObject, 'bpmn:IntermediateThrowEvent', 'bpmn:LinkEventDefinition') &&
                !isEventSubProcess(businessObject)) {

                assign(actions, {
                    'append.end-event': appendAction(
                        'bpmn:EndEvent',
                        'bpmn-icon-end-event-none',
                        translate('Append EndEvent')
                    ),
                    'append.gateway': appendAction(
                        'bpmn:ExclusiveGateway',
                        'bpmn-icon-gateway-none',
                        translate('Append Gateway')
                    ),
                    // 'append.append-task': appendAction(
                    //     'bpmn:Task',
                    //     'bpmn-icon-task',
                    //     translate('Append Task')
                    // ),
                    'append.append-user-task': appendAction(
                        'bpmn:UserTask',
                        'bpmn-icon-user-task',
                        translate('Append UserTask')
                    ),
                    'append.intermediate-event': appendAction(
                        'bpmn:IntermediateThrowEvent',
                        'bpmn-icon-intermediate-event-none',
                        translate('Append Intermediate/Boundary Event')
                    )
                });
            }
        }

        if (!popupMenu.isEmpty(element, 'bpmn-replace')) {

            // Replace menu entry
            assign(actions, {
                'replace': {
                    group: 'edit',
                    className: 'bpmn-icon-screw-wrench',
                    title: translate('Change type'),
                    action: {
                        click: function(event:any, element:any) {

                            const position = assign(getReplaceMenuPosition(element), {
                                cursor: { x: event.x, y: event.y }
                            });

                            popupMenu.open(element, 'bpmn-replace', position, {
                                title: translate('Change element'),
                                width: 300,
                                search: true
                            });
                        }
                    }
                }
            });
        }

        if (is(businessObject, 'bpmn:SequenceFlow')) {
            assign(actions, {
                'append.text-annotation': appendAction(
                    'bpmn:TextAnnotation',
                    'bpmn-icon-text-annotation',
                    translate('Append TextAnnotation')
                )
            });
        }

        if (
            isAny(businessObject, [
                'bpmn:FlowNode',
                'bpmn:InteractionNode',
                'bpmn:DataObjectReference',
                'bpmn:DataStoreReference',
            ])
        ) {
            assign(actions, {
                'append.text-annotation': appendAction(
                    'bpmn:TextAnnotation',
                    'bpmn-icon-text-annotation',
                    translate('Append TextAnnotation')
                ),

                'connect': {
                    group: 'connect',
                    className: 'bpmn-icon-connection-multi',
                    title: translate(
                        'Connect using ' +
                        (businessObject.isForCompensation
                            ? ''
                            : 'Sequence/MessageFlow or ') +
                        'Association'
                    ),
                    action: {
                        click: startConnect,
                        dragstart: startConnect,
                    },
                },
            });
        }

        if (is(businessObject, 'bpmn:TextAnnotation')) {
            assign(actions, {
                'connect': {
                    group: 'connect',
                    className: 'bpmn-icon-connection-multi',
                    title: translate('Connect using Association'),
                    action: {
                        click: startConnect,
                        dragstart: startConnect,
                    },
                },
            });
        }

        if (isAny(businessObject, [ 'bpmn:DataObjectReference', 'bpmn:DataStoreReference' ])) {
            assign(actions, {
                'connect': {
                    group: 'connect',
                    className: 'bpmn-icon-connection-multi',
                    title: translate('Connect using DataInputAssociation'),
                    action: {
                        click: startConnect,
                        dragstart: startConnect
                    }
                }
            });
        }

        if (is(businessObject, 'bpmn:Group')) {
            assign(actions, {
                'append.text-annotation': appendAction(
                    'bpmn:TextAnnotation',
                    'bpmn-icon-text-annotation',
                    translate('Append TextAnnotation')
                )
            });
        }

        // delete element entry, only show if allowed by rules
        let deleteAllowed = rules.allowed('elements.delete', { elements: [ element ] });

        if (isArray(deleteAllowed)) {

            // was the element returned as a deletion candidate?
            deleteAllowed = deleteAllowed[0] === element;
        }

        if (deleteAllowed) {
            assign(actions, {
                'delete': {
                    group: 'edit',
                    className: 'bpmn-icon-trash',
                    title: translate('Remove'),
                    action: {
                        click: removeElement
                    }
                }
            });
        }

        return actions;
    }

}

export const myContextPad = {contextPadProvider: ['type', MyContextPadProvider]};
