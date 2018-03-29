import FoodController from './FoodController';
import gameContext from '../../gameContext';
const {ccclass, property} = cc._decorator;

@ccclass
export default class NormalFood extends FoodController {
    public foodType = this.Type.normal;
    public countToNode: number = 0.5; // 每吃一个食物增加多少的node节点
    private ctx: cc.Graphics;
    public radius = 5;
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
    private seedCount = 0;
    private seed = null; // 子种子
    setSeedId(foodIndex) {
        this.seed = `${gameContext.randomSeed}${foodIndex}`;
    }
    random(min, max) {
        const randomSeed = `${this.seed}food${this.seedCount}`;
        this.seedCount += 1;
        return gameContext.getRandomIntBySeed(min, max, randomSeed);
    }
    init(mapWidth, mapHeight) {
        const foodPos = cc.v2(this.random(0, mapWidth), this.random(0, mapHeight))
        const color = new cc.Color(this.random(0, 255), this.random(0, 255), this.random(0, 255));
        if (!this.ctx) {
            this.ctx = this.node.addComponent(cc.Graphics);
            this.ctx.circle(0, 0, this.radius);
        }
        this.setColor(color);
        this.node.setPosition(foodPos);
        this.isEated = false;
        this.node.active = true;
    }
}
