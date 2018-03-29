import gameContext from '../../gameContext';
import SnakeNode from './SnakeNode';
const {ccclass, property} = cc._decorator;
const partType = gameContext.SnakePart;
@ccclass
export default class SnakeHeadNode extends SnakeNode {
    // 设置目标坐标（缓慢移动过去）
    public partType = partType.head;
    public aroundWall: cc.Collider[] = []; // 周边的墙
    public aroundFood = []; // 周边的食物
    public aroundSnakeNode = []; // 周边的蛇节点
    OnLoad() {
        this.circleCollider.radius = gameContext.snakeNodeSkinRadius * 5;
    }
    onCollisionEnter(other: cc.CircleCollider, self) {
        if (other.node.parent === self.node.parent) {
            return;
        }
        const otherGroup = other.node.group;
        if (otherGroup === 'wall') {
            this.aroundWall.push(other);
            // self.node.parent.emit('collisionWall');
            return;
        }
        if (otherGroup === 'food') {
            const foodController = other.node.getComponent('FoodController');
            this.aroundFood.push(foodController);
            // self.node.parent.emit('collisionFood', {
            //     controller: foodController,
            // });
            return;
        }
        if (otherGroup === 'snakeNode') {
            const otherController = other.node.getComponent('SnakeNode');
            this.aroundSnakeNode.push(otherController);
            return;
        }
    }
    onCollisionExit(other) {
        const otherGroup = other.node.group;
        if (otherGroup === 'wall') {
            this.aroundWall = this.aroundWall.filter(wall => {
                return other !== wall;
            });
            return;
        }
        if (otherGroup === 'food') {
            const foodController = other.node.getComponent('FoodController');
            this.aroundFood = this.aroundWall.filter(food => {
                return foodController !== food;
            });
            return;
        }
        if (otherGroup === 'snakeNode') {
            const otherController = other.node.getComponent('SnakeNode');
            this.aroundSnakeNode = this.aroundSnakeNode.filter(controller => {
                return otherController !== controller;
            });
            return;
        }
    }
    // 添加功能探测器
    addDetector(detector: cc.Prefab) {
        // if (!detector) {
        //     return;
        // }
        // const detectorNode = cc.instantiate(detector);
        // this.node.addChild(detectorNode);
    }
    OnDisable() {
        this.aroundWall = [];
        this.aroundFood = [];
        this.aroundSnakeNode = [];
    }
}
