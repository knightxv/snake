import gameContext from '../../gameContext';
import SnakeController from '../snake/SnakeController';
import FoodController from '../food/FoodController';
const {ccclass, property} = cc._decorator;

@ccclass
export default class BaseMapController extends cc.Component {
    @property({
        type: cc.Prefab,
        tooltip: '普通食物的prefab',
    })
    foodPrefab = null;
    
    @property({
        type: cc.Prefab,
        tooltip: '死后食物的prefab',
    })
    dieFoodPrefab = null;

    @property({
        type: cc.Prefab,
        tooltip: 'snake节点',
    })
    snakePrefab = null;

    protected normalFoodPool = new cc.NodePool();
    protected dieFoodPool = new cc.NodePool();
    protected snakePool = new cc.NodePool();

    public mapFoodCount = 50; // 每个地图的食物个数
    public nodeToDieFoodStep = 5; // 蛇死后每多少个节点生成一次死后食物
    public dieFoodDisRange = 10; // 蛇死后生成的节点偏移的距离范围
    public roomMaxCount = 10; // 每个地图的最大蛇数量（单机模式10人）
    public stepMakeAi = 100; // 每隔多少个30ms产生一次ai
    public wallWidth = 5;

    onLoad() {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = true;
        this.wallContainer = this.node.getChildByName('wallContainer');
        this.foodContainer = this.node.getChildByName('foodContainer');
        this.snakeContainer = this.node.getChildByName('snakeContainer');
        if (!this.foodPrefab) {
            cc.error('foodPrefab资源不存在');
            return;
        }
        if (!this.snakePrefab) {
            cc.error('foodPrefab资源不存在');
            return;
        }
        // 可以通过动态加载配置文件生成障碍物
        // const 
        const { width: mapWidth, height: mapHeight } = this.node;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        const mapWallLeftPoints = [
            cc.v2(0, 0),
            cc.v2(0, this.wallWidth),
            cc.v2(this.wallWidth, mapHeight),
            cc.v2(0, mapHeight),
        ];
        const mapWallDownPoints = [
            cc.v2(0, 0),
            cc.v2(mapWidth, 0),
            cc.v2(mapWidth, this.wallWidth),
            cc.v2(0, this.wallWidth),
        ];
        const mapWallRightPoints = [
            cc.v2(mapWidth - this.wallWidth, 0),
            cc.v2(mapWidth, 0),
            cc.v2(mapWidth, mapHeight),
            cc.v2(mapWidth - this.wallWidth, mapHeight),
        ];
        const mapWallUpPoints = [
            cc.v2(0, mapHeight - this.wallWidth),
            cc.v2(mapWidth, mapHeight - this.wallWidth),
            cc.v2(mapWidth, mapHeight),
            cc.v2(0, mapHeight),
        ];
        this.createWall(mapWallLeftPoints);
        this.createWall(mapWallDownPoints);
        this.createWall(mapWallRightPoints);
        this.createWall(mapWallUpPoints);
    }
    protected wallContainer: cc.Node | null = null;
    protected foodContainer: cc.Node | null = null;
    protected snakeContainer: cc.Node | null = null;
    protected mapWidth = 0;
    protected mapHeight = 0;
    // 得到死掉的蛇节点信息，然后生成食物
    protected createDieFoodBySnakeController(dieSnakeController: SnakeController) {
        const nodePoints = dieSnakeController.getDiePoints();
        nodePoints.forEach((point, i) => {
            if (i % this.nodeToDieFoodStep === 0) {
                // const stepX = gameContext.getRandomInt(-this.dieFoodDisRange, this.dieFoodDisRange);
                // const stepY = gameContext.getRandomInt(-this.dieFoodDisRange, this.dieFoodDisRange);
                // const newX = Math.floor(point.x)  + stepX; // 暂时性取0
                // const newY = Math.floor(point.y) + stepY; // 暂时性取0
                const newX = Math.floor(point.x)  + 0; // 暂时性取0
                const newY = Math.floor(point.y) + 0; // 暂时性取0
                const newPos = cc.v2(newX, newY);
                this.createDieFood(newPos);
            }
        });
        this.snakePool.put(dieSnakeController.node);
    }
     // 创建初始化死后食物
     protected createDieFood(pos: cc.Vec2) {
        const foodNode: cc.Node = this.dieFoodPool.get() || cc.instantiate(this.dieFoodPrefab);
        foodNode.group = 'food';
        foodNode.setPosition(pos);
        foodNode.parent = this.foodContainer;
    }
    // 创建墙体
    protected createWall(points: cc.Vec2[]) {
        const wallNode = new cc.Node('wall');
        wallNode.group = 'wall';
        const polygonCollider = wallNode.addComponent(cc.PolygonCollider);
        polygonCollider.points = points;
        this.wallContainer.addChild(wallNode);
    }
    // 创建初始化食物
    protected makeInitFoods() {
        for(let i = 0; i < this.mapFoodCount; i++) {
            this.createNormalFood(i);
        }
    }
    // 添加一个地图任意位置的食物
    protected addRandomPosFood() {
        const { mapWidth, mapHeight } = this;
        const foodNode: cc.Node =  this.normalFoodPool.get();
        if (!foodNode) {
            return;
        }
        const foodController = foodNode.getComponent('FoodController');
        foodController.init(mapWidth, mapHeight);
        foodNode.parent = this.foodContainer;
    }
    // 创建普通食物
    protected createNormalFood(foodIndex) {
        const { mapWidth, mapHeight } = this;
        const foodNode: cc.Node = cc.instantiate(this.foodPrefab);
        const foodController = foodNode.getComponent('FoodController');
        foodController.setSeedId(foodIndex);
        foodController.init(mapWidth, mapHeight);
        foodNode.parent = this.foodContainer;
    }
    // 生成蛇
    createSnake(data) {
        const snakeNode: cc.Node = this.snakePool.get() || cc.instantiate(this.snakePrefab);
        const SnakeController = snakeNode.getComponent('SnakeController');
        SnakeController.init(data);
        snakeNode.parent = this.snakeContainer;
        return SnakeController;
    }
    // 初始化一条Ai蛇
    createAiSnake(aINumber) {
        const initLength = gameContext.getRandomInt(5, 15);
        const initplaceX = gameContext.getRandomInt(100, 900);
        const initplaceY = gameContext.getRandomInt(10, 600);
        const initDeg = gameContext.getRandomInt(0, 360);
        const aiSnakeData = { // 玩家数据(要包括自己的数据)
            gameId: aINumber,
            userId: 233,
            name: `AI${aINumber}`, // 玩家名字
            snakeData: [], // 蛇的数据
            score: 0, // 分数
            aiNumber: aINumber, // '' ai的编号
            deg: initDeg,
        };
        for(let i = 0; i < initLength; i ++) {
            aiSnakeData.snakeData.push(cc.v2(initplaceX - i * 10, initplaceY));
        }
        return this.createSnake(aiSnakeData);
    }
    // 每过一次逻辑帧(拿到地图信息,进行地图食物的生成,把食物生成到一个量级)
    updateMap() {  }
    // 初始化地图
    initMap(playsData: any[]) {
        this.makeInitFoods();
        for(let i = 0; i < this.roomMaxCount; i++) {
            if (playsData[i]) {
                this.createSnake(playsData[i]);
            } else {
                this.createAiSnake(i);
            }
        }
    }
    // 得到所有蛇的控制器
    public getSnakeController(): SnakeController[] {
        return this.snakeContainer.children.map(child => {
            return child.getComponent(SnakeController);
        });
    }
    // 重置map
    public resetMap() {
        // this.snakeContainer.children.forEach(child => {
        //     const snakeController = child.getComponent(SnakeController);
        //     snakeController.onDie();
        // });
        this.snakeContainer.removeAllChildren()
        this.foodContainer.children.forEach(child => {
            const foodController = child.getComponent(FoodController);
            foodController.onEated();
        });
    }
}
