import BaseMapController from './BaseMapController';
import gameContext from '../../gameContext';
import SnakeController from '../snake/SnakeController';
import FoodController from '../food/FoodController';
const {ccclass, property} = cc._decorator;

@ccclass
export default class EndLessMapController extends BaseMapController {
    updateMap() {
        console.log('update map:' + gameContext.clientFrame);
        // 可以利用gameContext的updateTick方法,把判断逻辑抽取到各个组件自行判断。(但是不实现)
        let roomSnakeCount = 0; // 现在房间的总人数
        this.snakeContainer.children.forEach(child => {
            const snakeController = child.getComponent(SnakeController);
            const headerControll = snakeController.headerControll;
            if (!headerControll || !child.active) {
                return;
            }
            const { aroundFood, aroundSnakeNode, aroundWall } = headerControll;
            const snakeRadius = gameContext.snakeNodeSkinRadius;
            const curPos = headerControll.node.parent.convertToWorldSpaceAR(headerControll.getCurrentPos());
            // 判断蛇有没有撞墙
            const minX = curPos.x - snakeRadius;
            const maxX = curPos.x + snakeRadius;
            const minY = curPos.y - snakeRadius;
            const maxY = curPos.y + snakeRadius;
            const { width: mapWidth, height: mapHeight } = this.node;
            if (minX <= this.wallWidth || maxX >= mapWidth - this.wallWidth
                || minY <= this.wallWidth || maxY >= mapHeight - this.wallWidth) {
                    console.log('onCollsionWall');
                    snakeController.onCollsionWall();
                }
            if (snakeController.isAi) {
                const wallWarnDis = 10; // 墙的警戒距离
                if (minX - wallWarnDis <= this.wallWidth || maxX + wallWarnDis >= mapWidth - this.wallWidth
                    || minY - wallWarnDis <= this.wallWidth || maxY + wallWarnDis >= mapHeight - this.wallWidth) {
                        console.log('avoid wall Danger');
                        snakeController.avoidDanger();
                }
            }
            // 判断蛇有没有吃食物
            aroundFood.forEach((foodControl: FoodController) => {
                const foodPoint = cc.v2(foodControl.node.position);
                const dis = gameContext.reducePrecision(curPos.sub(foodPoint).mag());
                if (dis <= snakeRadius + foodControl.radius) {
                    console.log(`eat food${dis}`)
                    snakeController.onEatFood(foodControl);
                }
            });
            // 对数组进行排序,使他们的计算顺序一样
            aroundSnakeNode.sort((controller1, controller2) => {
                return controller1.node.parent.getComponent(SnakeController).gameId - controller2.node.parent.getComponent(SnakeController).gameId;
            });
            // 判断有没有撞到其他蛇
            !snakeController.isSaveState && aroundSnakeNode.some((snakeNodeController) => {
                const nodeWolrldPos = snakeNodeController.node.parent.convertToWorldSpaceAR(snakeNodeController.getCurrentPos());
                const dis = Math.floor(curPos.sub(nodeWolrldPos).mag());
                console.log(`${snakeController.gameId}->${snakeNodeController.node.parent.getComponent(SnakeController).gameId},dis(${dis})`);
                if (dis <= snakeRadius * 2) {
                    const otherSnakeController = snakeNodeController.node.parent.getComponent(SnakeController);
                    if (!otherSnakeController.isSaveState) {
                        snakeController.onCollisionOtherSnake(otherSnakeController);
                        return true;
                    }
                    return false;
                }
                // 如果是ai并且小于警戒范围就把SnakeController设为危险状态
                if (snakeController.isAi && dis <= (snakeRadius * 2 + 10)) {
                    console.log(' (dis):', dis)
                    snakeController.avoidDanger();
                }
                return false;
            });
            // 回收每个死掉的蛇,没死就移动它
            if (snakeController.isKilled) {
                this.createDieFoodBySnakeController(snakeController);
                this.snakePool.put(child);
            } else {
                snakeController.move();
                roomSnakeCount ++;
            }
        });

        // 把死掉的ai蛇换个地方出生
        // ...

        // 把所有的被吃掉的食物推到池里(把被吃掉的食物换个地方产生)
        this.foodContainer.children.forEach(child => {
            const foodController = child.getComponent(FoodController);
            if (!foodController.isEated) {
                return;
            }
            if (foodController.foodType = foodController.Type.normal) {
                this.normalFoodPool.put(foodController.node);
                this.addRandomPosFood();
            } else {
                this.dieFoodPool.put(foodController.node);
            }
        });
    }
}
