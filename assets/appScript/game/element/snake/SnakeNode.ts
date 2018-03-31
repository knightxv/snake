import gameContext from '../../gameContext';
const {ccclass, property} = cc._decorator;
const partType = gameContext.SnakePart;
@ccclass
export default class SnakeNode extends cc.Component {
    // 设置目标坐标（缓慢移动过去）
    public partType = partType.body;
    private targetPoint: cc.Vec2 | null = null;
    private nextControll: SnakeNode | null = null;
    private bgNode: cc.Node;
    protected circleCollider;
    onLoad() {
        this.circleCollider = this.node.addComponent(cc.CircleCollider);
        this.circleCollider.radius = gameContext.snakeNodeSkinRadius;
        this.OnLoad();
    }
    OnLoad() {}
    private curPos; // 当前的位置
    // tarViewPos:视图的位置 tarDataPos:计算的位置
    public moveNext(tarPos) {
        // 图的旋转
        const curPos: cc.Vec2 = this.node.position;
        const ViewdisV2 = tarPos.sub(curPos);
        const dataDisV2 = tarPos.sub(this.getCurrentPos());
        const rad = ViewdisV2.signAngle(cc.v2(1, 0));
        const deg = gameContext.getDegByRad(rad) - 90;
        this.node.rotation = -deg;
        // 设置下一节点的目标位置(离目标差一个身位)
        if (this.nextControll) {
            let nextTarPos = tarPos;
            if (dataDisV2.mag() !== 0) {
                nextTarPos = tarPos.sub(dataDisV2.normalize().mul(gameContext.snakeNodeRadius * 2));
            }
            this.nextControll.moveNext(nextTarPos);
        }
        this.node.setPosition(this.getCurrentPos());
        // 移动到指定目标 
        this.node.stopAllActions();
        this.node.runAction(cc.moveTo(gameContext.tickTime / 1000, tarPos)); 
        this.curPos = tarPos;
    }
    // 得到当前帧的位置
    public getCurrentPos(): cc.Vec2 {
        return this.curPos || this.node.position;
    }
    public setNextController(nextController) {
        this.nextControll = nextController;
    }
    // public setPos(tarPos) {
    //     this.node.position = tarPos;
    // }
    // 加载皮肤
    public loadSkin() {
    }
    public getPartType() {
        return this.partType;
    }
    // 设置皮肤特效
    setSkinEffect() {
        if (this.bgNode) {
            this.bgNode.active = true;
            return;
        }
        // 设置背景
        let imgRealPath = '';
        if (this.getPartType() === partType.head) {
            imgRealPath = cc.url.raw('resources/game/element/snake/textures/head.fw.png')
        } else if (this.getPartType() === partType.body) {
            imgRealPath = cc.url.raw('resources/game/element/snake/textures/node.fw.png');
        }
        if (!imgRealPath) {
            cc.error('没有指定部位');
            return;
        }
        cc.textureCache.addImage(imgRealPath, (texture) => {
            const bgNode = new cc.Node('background');
            const bgSprite = bgNode.addComponent(cc.Sprite);
            const spriteFrame = new cc.SpriteFrame(texture);
            bgSprite.spriteFrame = spriteFrame;
            this.node.addChild(bgNode);
            this.bgNode = bgNode;
        }, this);
    }
    onDisable() {
        this.nextControll = null;
        this.curPos = null;
        this.OnDisable();
        if (this.bgNode) {
            this.bgNode.active = false;
        }
    }
    OnDisable() {}
    // update() {
    //     // if (this.targetPoint) {

    //     // }
    // }
}
