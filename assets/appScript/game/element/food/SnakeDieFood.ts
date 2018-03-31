import FoodController from './FoodController';
const {ccclass, property} = cc._decorator;

@ccclass
export default class SnakeDieFood extends FoodController {
    public foodType = this.Type.snakeDie;
    public countToNode: number = 1;
    public foodScore = 2; // 吃这个食物能加多少分
    public radius = 10;

}
