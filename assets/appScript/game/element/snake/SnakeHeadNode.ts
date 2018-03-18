import gameContext from '../../gameContext';
import SnakeNode from './SnakeNode';
const {ccclass, property} = cc._decorator;
const partType = gameContext.SnakePart;
@ccclass
export default class SnakeHeadNode extends SnakeNode {
    // 设置目标坐标（缓慢移动过去）
    public partType = partType.head;
    Onload() {
        console.log(13333)
    }
    onCollisionEnter(other: cc.CircleCollider, self) {
        if (!other.node.parent || !self.node.parent) {
            return;
        }
        const otherGroup = other.node.group;
        if (otherGroup === 'wall') {
            self.node.parent.emit('collisionWall');
            return;
        }
        if (otherGroup === 'food') {
            const foodController = other.node.getComponent('FoodController');
            self.node.parent.emit('collisionFood', {
                controller: foodController,
            });
            return;
        }
        if (otherGroup === 'snakeNode') {
            const otherController = other.node.parent.getComponent('SnakeController');
            const otherSnakeGameId = otherController.gameId;
            if (otherController.isSaveState) {
                return;
            }
            const selfSnakeGameId = self.node.parent.getComponent('SnakeController').gameId;
            otherSnakeGameId !== selfSnakeGameId && self.node.parent.emit('collisionSnake', {
                controller: otherController,
            });
            return;
        }
    }
    // 添加功能探测器
    addDetector(detector: cc.Prefab) {
        if (!detector) {
            return;
        }
        const detectorNode = cc.instantiate(detector);
        this.node.addChild(detectorNode);
    }
    
}
