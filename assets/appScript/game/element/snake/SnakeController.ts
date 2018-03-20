import gameContext from '../../gameContext';
import SnakeNodeController from './SnakeNode';
import SnakeHeadNodeController from './SnakeHeadNode';

const {ccclass, property} = cc._decorator;
const snakeNodeType = gameContext.SnakePart;


// 实现蛇的控制，给定一个vKey（degress）
@ccclass
export default class SnakeController extends cc.Component {
    @property(cc.Prefab)
    snakeHeadPrefab = null;
    
    @property(cc.Prefab)
    snakeBodyPrefab = null;

    @property({
        type: cc.Prefab,
        tooltip: 'ai碰撞探测器',
    })
    aiDetector = null;

    private curDegress = 0; // 目前的角度
    public headerControll: SnakeHeadNodeController | null = null;
    public gameId;
    public isQuickSpeed = false; // 是否加速
    public controllDeg = 0; // 进度方向(deg)
    public score = 0; // 本条蛇的分数
    public isSaveState = true; // 是否是受保护状态
    public initSaveTime = 1; // 初始化的保护时间
    public snakeData: any = {};
    public isKiided = false; // 是否死掉了
    public skinStep = 2; // 多少个节点生成一个皮肤节点
    
    private bodyNodePool = new cc.NodePool(); // 身体节点池
    private putInBodyPool(bodyNode: cc.Node) {
        this.bodyNodePool.put(bodyNode);
    }
    // 死掉的时候point
    public _diePoints: cc.Vec2[]= [];
    // 转向某个角度(用于外部调用)
    public move() {
        this.realMoveTo(this.controllDeg, this.isQuickSpeed);
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
        // const targetPointInt = cc.v2(Math.floor(targetPoint.x), Math.floor(targetPoint.y));
        headerControll.moveNext(targetPoint);
    }
    init(data) {
        const { gameId, userId, name, snakeData, teamId, score, aiNumber } = data;
        this.gameId = gameId;
        this.score = score;
        this.isSaveState = true;
        this.eatCount = 0;
        this.node.active = true;
        this.isKiided = false;
        this.isQuickSpeed = false;
        // this.curDegress = 0; 
        this.snakeData = data;
        this.create(snakeData);
        if (aiNumber !== null) {
            this.headerControll.addDetector(this.aiDetector);
        }
        this.scheduleOnce(() => {
            this.isSaveState = false;
        }, this.initSaveTime);
        this.listener();
    }
    // 当死亡时(把每个节点放回实体工厂,然后发布信息信息出去)
    public onDie() {
        this._diePoints = this.getNodePoints();
        // 回收每个body节点，然后隐藏全部子节点，删除头部(和尾部)
        this.node.children.forEach(snakeNode => {
            const snakeNodeController = snakeNode.getComponent('SnakeNode');
            snakeNode.active = false;
            if (snakeNodeController.getPartType() === snakeNodeType.body) {
                this.putInBodyPool(snakeNode);
            } else {
                snakeNode.destroy();
            }
        });
        this.node.removeAllChildren();
        this.isKiided = true;
        this.node.active = false;
        this.removeListener();
        this.preAddedControll = null;
        this.headerControll = null;
        this.snakeData = null;
    }
    // 监听
    listener() {
        this.node.on('collisionWall', this.onCollsionWall, this);
        this.node.on('collisionFood', this.onEatFood, this);
        this.node.on('collisionSnake', this.onCollisionOtherSnake, this);
        this.node.on('wallWarn', this.WallWarn, this);
        this.node.on('emenyWarn', this.emenyWarn, this);
        // this.node.on('foodPrice', this.collisionPrice, this);
    }
    // 避免危险（改变方向）
    avoidDanger() {
        this.controllDeg += gameContext.getRandomInt(90, 180);
    }
    WallWarn() {
        this.avoidDanger();
    }
    emenyWarn(ev) {
        const otherSnakeController: SnakeController = ev.detail.controller;
        if (!otherSnakeController) {
            return;
        }
        if (otherSnakeController.gameId !== this.gameId) {
            this.avoidDanger();
        }
    }
    // collisionPrice() {}
    removeListener() {
        this.node.off('collisionWall', this.onCollsionWall);
        this.node.off('collisionFood', this.onEatFood);
        this.node.off('collisionSnake', this.onCollisionOtherSnake);
        this.node.off('wallWarn', this.WallWarn);
        this.node.off('emenyWarn', this.emenyWarn);
    }
    // 撞墙了
    onCollsionWall(ev) {
        const killByWallEvent = new cc.Event.EventCustom(gameContext.EventType.onKillByWall, true);
        killByWallEvent.setUserData({
            snakeKilled: this,
        });
        this.node.dispatchEvent(killByWallEvent);
        this.onDie();
        ev.stopPropagation();
    }
    private eatCount = 0; // 剩余还没消化的食物（当还未消化的食物大于1）
    // 当吃食物时
    onEatFood(ev: cc.Event.EventCustom) {
        const foodController = ev.detail.controller;
        foodController.onEated();
        const countToNode = foodController.countToNode;
        const foodScore = foodController.foodScore;
        this.eatCount += countToNode;
        this.score += foodScore;
        if (this.eatCount < 1) {
            return;
        }
        this.foodToNode();
        this.eatCount -= 1;
        ev.stopPropagation();
    }
    // 把食物转换为节点
    foodToNode() {
        const lastNodePos = this.node.children[this.node.childrenCount - 1].position;
        const pos = cc.v2(lastNodePos); // 把生成的节点放在同最后一个的位置
        this.createNode(snakeNodeType.body, pos);
    }
    // 当碰撞到其他蛇的时候
    onCollisionOtherSnake(ev) {
        const otherSnakeController = ev.detail.controller;
        const killEvent = new cc.Event.EventCustom(gameContext.EventType.onSnakeKillOtherSnake, true);
        killEvent.setUserData({
            snakeKill: otherSnakeController,
            snakeKilled: this,
        });
        this.node.dispatchEvent(killEvent);
        this.onDie();
        ev.stopPropagation();
    }
    // 添加节点
    private preAddedControll: SnakeNodeController | null = null;
    public createNode(type, point: cc.Vec2) {
        // 同步创建节点，然后异步加载皮肤
        // 等后面可以用池子加保存
        let snakeNode: cc.Node | null;
        if (type === snakeNodeType.head) {
            snakeNode = cc.instantiate(this.snakeHeadPrefab);
            const snakeNodeController = snakeNode.getComponent(SnakeHeadNodeController);
            snakeNodeController.setSkinEffect(); // 可以省略(让蛇头自己加载)
            this.preAddedControll = snakeNodeController;
            this.headerControll = snakeNodeController;
            
        } else if (type === snakeNodeType.body) {
            snakeNode = this.bodyNodePool.get() || cc.instantiate(this.snakeBodyPrefab);
            const snakeNodeController = snakeNode.getComponent(SnakeNodeController);
            if (this.preAddedControll) {
                this.preAddedControll.setNextController(snakeNodeController);
                this.preAddedControll = snakeNodeController;
            }
            const bodyLenght = this.node.childrenCount;
            if (bodyLenght % this.skinStep === 0) {
                snakeNodeController.setSkinEffect();
            }
        }
        this.node.addChild(snakeNode);
        snakeNode.setPosition(point);
        snakeNode.active = true;
    }
    // 通过一段数组position来创建蛇 cc.v2[]
    public create(snakeInitPoints: cc.Vec2[]) {
        if (!snakeInitPoints || snakeInitPoints.length < 1) {
            cc.error('创建坐标数组至少为一');
            return;
        }
        this.createNode(snakeNodeType.head, snakeInitPoints[0])
        for(let i = 1; i < snakeInitPoints.length - 1; i++) {
            this.createNode(snakeNodeType.body, snakeInitPoints[i])
        }
    }
    // 得到所有节点世界坐标的信息
    public getNodePoints(): cc.Vec2[] {
        return this.node.children.map(childNode => {
            return this.node.convertToWorldSpaceAR(childNode.position);
        })
    }
    // 得到死的时候节点们世界point
    public getDiePoints() {
        return this._diePoints;
    }
}
