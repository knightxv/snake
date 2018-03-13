const {ccclass, property} = cc._decorator;

@ccclass
export default class UIMain extends cc.Component {
    onLoad() {
        const pveNode = cc.find('playbtn/duoren', this.node);
        pveNode.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.dispatchEvent(new cc.Event.EventCustom('pveGameStart', true));
        })
        // const pvpNode = this.node.getChildByName('playbtn/danren');
        // pvpNode.on(cc.Node.EventType.TOUCH_END, () => {
        //     this.node.dispatchEvent(new cc.Event.EventCustom('pvpGameStart', true));
        // })
    }
}

