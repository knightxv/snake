import BaseMapController from './BaseMapController';
import gameContext from '../../gameContext';
import SnakeController from '../snake/SnakeController';
import FoodController from '../food/FoodController';
const {ccclass, property} = cc._decorator;

@ccclass
export default class NetMapController extends BaseMapController {
    updateMap() {
        console.log(1);
    //     public aroundWall: cc.Collider[] = []; // 周边的墙
    // public aroundFood = []; // 周边的食物
    // public aroundSnakeNode = []; // 周边的蛇节点
    }
}
