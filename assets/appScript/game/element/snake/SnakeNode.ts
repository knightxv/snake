import gameContext from '../../gameContext';
const {ccclass, property} = cc._decorator;
const partType = gameContext.SnakePart;
@ccclass
export default class SnakeNode extends cc.Component {
    // 设置目标坐标（缓慢移动过去）
    public partType = partType.body;
    private targetPoint: cc.Vec2 | null = null;
    onLoad() {
        const circleCollider = this.node.addComponent(cc.CircleCollider);
        circleCollider.radius = 16;
        this.OnLoad();
    }
    OnLoad() {

    }
    public moveNext(tarPos: cc.Vec2) {
        // 移动到指定目标
        this.node.stopAllActions();
        this.node.runAction(cc.moveTo(gameContext.tickTime / 1000, tarPos));
        // 图的旋转
        const curPos: cc.Vec2 = cc.v2(this.getPos());
        const disV2 = tarPos.sub(curPos);
        const rad = disV2.signAngle(cc.v2(1, 0));
        const deg = gameContext.getDegByRad(rad) - 90;
        this.node.rotation = -deg;
        // 设置下一节点的目标位置(离目标差一个身位)
        if (this.nextControll) {
            let nextTarPos = tarPos;
            if (disV2.mag() !== 0) {
                const disTarPos = disV2.normalize().mul(gameContext.snakeNodeRadius * 2);
                nextTarPos = tarPos.sub(disTarPos);
            }
            this.nextControll.moveNext(nextTarPos);
        }
    }
    private nextControll: SnakeNode | null = null;
    public setNextController(nextController) {
        this.nextControll = nextController;
    }
    public setPos(tarPos) {
        this.node.position = tarPos;
    }
    public getPos(): cc.Vec2 {
        return this.node.position;
    }
    // 加载皮肤
    public loadSkin() {

    }
    public getPartType() {
        return this.partType;
    }
    // 设置皮肤特效
    setSkinEffect() {
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
        }, this);
    }
    // update() {
    //     // if (this.targetPoint) {

    //     // }
    // }
}
