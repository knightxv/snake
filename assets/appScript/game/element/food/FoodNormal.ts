import FoodController from './FoodController';
const {ccclass, property} = cc._decorator;

@ccclass
export default class NormalFood extends FoodController {
    public foodType = this.Type.normal;
    public countToNode: number = 0.5; // 每吃一个食物增加多少的node节点
    private ctx: cc.Graphics;
    // OnLoad() {
        // console.log(2)
        // this.ctx = this.node.addComponent(cc.Graphics);
        // this.ctx.circle(0, 0, 5);
        // this.ctx.fillColor = new cc.Color(255, 255, 30);
        // this.ctx.fill();
    // }
    setColor(color: cc.Color) {
        this.ctx.fillColor = color;
        this.ctx.fill();
    }
    init(pos: cc.Vec2, color: cc.Color) {
        if (!this.ctx) {
            this.ctx = this.node.addComponent(cc.Graphics);
            this.ctx.circle(0, 0, 5);
        }
        this.setColor(color);
        this.node.setPosition(pos);
        this.node.active = true;
    }
}
