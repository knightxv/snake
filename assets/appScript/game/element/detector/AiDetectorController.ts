/*
    探测器(ai专用)，用于检测周边环境。用判断改变行动
*/
const {ccclass, property} = cc._decorator;

enum Event {
    wallWarn = 'wallWarn', // 墙壁警告
    foodPrice = 'foodPrice', // 墙壁警告
    emenyWarn = 'emenyWarn', // 墙壁警告
};

@ccclass
export default class AiDetectorController extends cc.Component {
    public Event = Event;
    onLoad() {
    }
    onCollisionEnter(other: cc.CircleCollider, self) {
        if (!other.node.parent || !self.node.parent) {
            return;
        }
        const otherGroup = other.node.group;
        if (otherGroup === 'wall') {
            const wallWaringEvent = new cc.Event.EventCustom(Event.wallWarn, true);
            this.node.dispatchEvent(wallWaringEvent);
            return;
        }
        if (otherGroup === 'snakeNode') {
            const otherController = other.node.parent.getComponent('SnakeController');
            const otherSnakeGameId = otherController.gameId;
            const emenyWarnEvent = new cc.Event.EventCustom(Event.emenyWarn, true);
            emenyWarnEvent.setUserData({
                controller: otherController,
            });
            this.node.dispatchEvent(emenyWarnEvent);
            return;
        }
        // if (otherGroup === 'food') {
        //     const foodPriceEvent = new cc.Event.EventCustom(Event.foodPrice, true);
        //     this.node.dispatchEvent(foodPriceEvent);
        //     return;
        // }
        
    }
}
