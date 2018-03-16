import gameContext from '../gameContext';
import SnakeNodeController from './SnakeNode';

const {ccclass, property} = cc._decorator;
const snakeNodeType = gameContext.SnakePart;

const snakePath = {
    [snakeNodeType.body]: 'game/snake/prefab/snakeBody',
    [snakeNodeType.head]: 'game/snake/prefab/snakeHead',
    // [snakeNodeType.head]: 'game/snake/prefab/snakeTail',
};

// 实现蛇的控制，给定一个vKey（degress）
@ccclass
export default class SnakeController extends cc.Component {
    @property(cc.Prefab)
    snakeHeadPrefab = null;
    
    @property(cc.Prefab)
    snakeBodyPrefab = null;

    private curDegress = 0; // 目前的角度
    public headerControll: SnakeNodeController | null = null;
    // 转向某个角度(用于外部调用)
    public moveTo(targetDegress: number, isQuick?: boolean) {
        this.realMoveTo(targetDegress, isQuick);
    }
    // 下一步移动的角度
    private realMoveTo(nextHeadDegress, isQuick) {
        const headerControll = this.headerControll;
        if (!headerControll) {
            return;
        }
        const headPos = headerControll.getPos();
        const disPos = gameContext.getDisPosByDeg(nextHeadDegress, isQuick);
        const targetPoint = headPos.add(disPos);
        headerControll.moveNext(targetPoint);
    }
    init(data) {
        const { gameId, userId, name, snakeData, teamId, score, aiNumber } = data;
        if (!this.snakeHeadPrefab || !this.snakeBodyPrefab) {
            cc.error('head or body prefab not exit');
            return;
        }
        this.create(snakeData);
    }
    // 添加节点
    private preAddedControll: SnakeNodeController | null = null;
    public createNode(type, point: cc.Vec2) {
        // 同步创建节点，然后异步加载皮肤
        // 等后面可以用池子加保存
        let snakeNode: cc.Node | null;
        if (type === snakeNodeType.head) {
            snakeNode = cc.instantiate(this.snakeHeadPrefab);
        } else if (type === snakeNodeType.body) {
            snakeNode = cc.instantiate(this.snakeBodyPrefab);
        }
        if (!snakeNode) {
            cc.error('SnakeController: snake node 不存在');
            return;
        }
        snakeNode.setPosition(point);
        this.addNode(snakeNode);
    }
    private bodyLenght = 0;
    public addNode(snakeNode) {
        const snakeNodeController = snakeNode.getComponent(SnakeNodeController);
        const type = snakeNodeController.getPartType();
        if (this.bodyLenght % 2 === 0) {
            snakeNodeController.setSkinEffect();
        }
        this.bodyLenght += 1;
        if (type === snakeNodeType.head) {
            this.preAddedControll = snakeNodeController;
            this.headerControll = snakeNodeController;
            return this.node.addChild(snakeNode, 3);
        } else if (type === snakeNodeType.body) {
            if (this.preAddedControll) {
                this.preAddedControll.setNextController(snakeNodeController);
                this.preAddedControll = snakeNodeController;
                return this.node.addChild(snakeNode, 2);
            }
        }
    }
    // 子节点的坐标(世界)
    private snakePoints: cc.Vec2[] = [];
    // 通过一段数组position来创建蛇 cc.v2[]
    public create(snakeInitPoints: cc.Vec2[]) {
        if (!snakeInitPoints || snakeInitPoints.length < 1) {
            cc.error('创建坐标数组至少为一');
            return;
        }
        const createArrPromise = [];
        this.createNode(snakeNodeType.head, snakeInitPoints[0])
        for(let i = 1; i < snakeInitPoints.length - 1; i++) {
            this.createNode(snakeNodeType.body, snakeInitPoints[i])
        }
    }
}
