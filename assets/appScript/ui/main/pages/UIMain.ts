const {ccclass, property} = cc._decorator;

@ccclass
export default class UIMain extends cc.Component {
    onLoad() {
        
    }
    // 无尽模式
    onEndLessBtnClick() {
        cc.log('111111111无尽模式点击')
        this.node.dispatchEvent(new cc.Event.EventCustom('endlessGame', true));
    }
    // 限时模式
    onTimeLimitClick() {
        cc.log('111111111单人模式点击')
        this.node.dispatchEvent(new cc.Event.EventCustom('timeLimitSingle', true));
    }
    // 组队模式
    onTeamClick() {
        this.node.dispatchEvent(new cc.Event.EventCustom('timeLimitTeam', true));
    }
}

