const {ccclass, property} = cc._decorator;
// 控制手柄

enum eventType {
    cancelQuickController = 'cancelQuickController',
    quickController = 'quickController',
    dirController = 'dirController',
};

@ccclass
export default class HandleController extends cc.Component {
    // @property({
    //     type: cc.Component.EventHandler,
    //     tooltip: '控制方向',
    // })
    // dirController = [];

    // @property({
    //     type: cc.Component.EventHandler,
    //     tooltip: '控制加速',
    // })
    // quickController = [];

    // @property({
    //     type: cc.Component.EventHandler,
    //     tooltip: '取消加速',
    // })
    // cancelQuickController = [];
    private innnercircle: cc.Node | null = null;
    private outSideCircle: cc.Node | null = null;
    private quickBtn: cc.Node | null = null;
    private innerCircleR: number = 0; // 内圆半径
    private outCircleR: number = 0; // 外圆半径
    public EventType = eventType;
    onLoad() {
        this.innnercircle = cc.find('outsideCircle/innerCircle', this.node);
        const innerCircleR = this.innnercircle.getComponent('Circle').circlrRad;
        this.innerCircleR = innerCircleR;
        this.outSideCircle = cc.find('outsideCircle', this.node);
        const outCircleR = this.outSideCircle.getComponent('Circle').circlrRad;
        this.outCircleR = outCircleR;
        this.quickBtn = cc.find('quick', this.node);
        this.quickBtn.on(cc.Node.EventType.TOUCH_START, this.quick, this);
        this.quickBtn.on(cc.Node.EventType.TOUCH_END, this.cancelQuick, this);
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchController, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchController, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onLoseController, this);
    }
    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.touchController);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.touchController);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onLoseController);
        this.quickBtn.off(cc.Node.EventType.TOUCH_START, this.quick);
        this.quickBtn.off(cc.Node.EventType.TOUCH_END, this.cancelQuick);
    }
    touchController(ev: cc.Event.EventTouch) {
        // const touchPos = ev.getLocation();
        // const halfWidth = this.node.width / 2;
        this.onController(ev);
        // if (touchPos.x <= halfWidth) {
        // }

    }
    // 控制方向
    onController(ev: cc.Event.EventTouch) {
        if (!this.innnercircle ||!this.outSideCircle) {
            cc.error('控制圆不存在');
            return;
        }
        const touchPos = cc.v2(ev.getLocation());
        if (touchPos.mag() === 0) {
            return;
        }
        this.innnercircle.stopAllActions();
        const touchWordPos = this.node.convertToNodeSpace(touchPos);
        let innerLocalPos = this.outSideCircle.convertToNodeSpace(touchWordPos);
        const isOutSide = innerLocalPos.mag() > (this.outCircleR - this.innerCircleR);
        if (isOutSide) {
            innerLocalPos = innerLocalPos.normalize().mul(this.outCircleR - this.innerCircleR);
        }
        this.innnercircle.setPosition(innerLocalPos);
        const dirRad = innerLocalPos.signAngle(cc.v2(1, 0));
        this.node.emit(this.EventType.dirController, {
            dirRad,
        });
        // cc.Component.EventHandler.emitEvents(this.dirController, dirRad);
        ev.stopPropagation();
    }
    // 加速
    quick(ev: cc.Event.EventTouch) {
        // cc.Component.EventHandler.emitEvents(this.quickController);
        this.node.emit(this.EventType.quickController);
        ev.stopPropagation();
    }
    // 取消加速
    cancelQuick(ev: cc.Event.EventTouch) {
        // cc.Component.EventHandler.emitEvents(this.cancelQuickController);
        this.node.emit(this.EventType.cancelQuickController);
        ev.stopPropagation();
    }
    // 失去控制
    onLoseController(ev: cc.Event.EventTouch) {
        this.innnercircle.stopAllActions();
        this.innnercircle.runAction(cc.moveTo(0.1, cc.Vec2.ZERO).easing(cc.easeCubicActionOut()));
    }
}
