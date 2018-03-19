import gameContext from '../../gameContext';
import SnakeController from '../snake/SnakeController';
import FoodController from '../food/FoodController';
const {ccclass, property} = cc._decorator;

@ccclass
export default class MapController extends cc.Component {
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

    private normalFoodPool = new cc.NodePool();
    private dieFoodPool = new cc.NodePool();
    private snakePool = new cc.NodePool();

    public mapFoodCount = 20; // 每个地图的食物个数
    public nodeToDieFoodStep = 5; // 蛇死后每多少个节点生成一次死后食物
    public dieFoodDisRange = 10; // 蛇死后生成的节点偏移的距离范围
    public roomMaxCount = 10; // 每个地图的最大蛇数量（单机模式10人）
    public stepMakeAi = 100; // 每隔多少个30ms产生一次ai
    public clientFrameCount = 0; // 客户端现在是第几个帧

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
        this.makeInitFoods();
    }
    public wallWidth = 5;
    private wallContainer: cc.Node | null = null;
    private foodContainer: cc.Node | null = null;
    private snakeContainer: cc.Node | null = null;
    private mapWidth = 0;
    private mapHeight = 0;
    // 得到死掉的蛇节点信息，然后生成食物
    private createDieFoodBySnakeController(dieSnakeController: SnakeController) {
        const nodePoints = dieSnakeController.getDiePoints();
        nodePoints.forEach((point, i) => {
            if (i % this.nodeToDieFoodStep === 0) {
                const stepX = gameContext.getRandomInt(-this.dieFoodDisRange, this.dieFoodDisRange);
                const stepY = gameContext.getRandomInt(-this.dieFoodDisRange, this.dieFoodDisRange);
                const newX = Math.floor(point.x)  + stepX;
                const newY = Math.floor(point.y) + stepY;
                const newPos = cc.v2(newX, newY);
                this.createDieFood(newPos);
            }
        });
        this.snakePool.put(dieSnakeController.node);
    }
    // 创建墙体
    private createWall(points: cc.Vec2[]) {
        const wallNode = new cc.Node('wall');
        wallNode.group = 'wall';
        const polygonCollider = wallNode.addComponent(cc.PolygonCollider);
        polygonCollider.points = points;
        this.wallContainer.addChild(wallNode);
    }
    // 创建初始化食物
    private makeInitFoods() {
        for(let i = 0; i < this.mapFoodCount; i++) {
            this.addRandomPosFood();
        }
    }
    // 添加一个地图任意位置的食物
    private addRandomPosFood() {
        const { mapWidth, mapHeight } = this;
        const foodPos = cc.v2(gameContext.getRandomInt(0, mapWidth), gameContext.getRandomInt(0, mapHeight))
        this.createNormalFood(foodPos);
    }
    // 创建初始化死后食物
    private createDieFood(pos: cc.Vec2) {
        const foodNode: cc.Node = this.dieFoodPool.get() || cc.instantiate(this.dieFoodPrefab);
        foodNode.group = 'food';
        foodNode.setPosition(pos);
        foodNode.parent = this.foodContainer;
    }
    // 创建普通食物
    private createNormalFood(pos: cc.Vec2) {
        const foodNode: cc.Node = this.normalFoodPool.get() || cc.instantiate(this.foodPrefab);
        const foodController = foodNode.getComponent('FoodController');
        const color = new cc.Color(gameContext.getRandomInt(0, 255), gameContext.getRandomInt(0, 255), gameContext.getRandomInt(0, 255));
        foodController.init(pos, color);
        foodController.isEated = false;
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
    // 每过一次逻辑帧(拿到地图信息,进行地图食物的生成,把食物生成到一个量级)
    updateMap() {
        // 回收每个死掉的蛇,没死就移动它
        let roomSnakeCount = 0; // 现在房间的总人数
        this.snakeContainer.children.forEach(child => {
            const snakeController = child.getComponent(SnakeController);
            if (snakeController.isKiided) {
                this.createDieFoodBySnakeController(snakeController);
                this.snakePool.put(child);
            } else {
                snakeController.move();
                roomSnakeCount ++;
            }
        });
        // 根据蛇的数量来判断是否加入ai(预留几个位置给玩家)
        // 每次更新最多加一个ai，如果玩超过最大减去预留位置，就不再产生ai
        if (this.clientFrameCount % this.stepMakeAi === 0 && roomSnakeCount < this.roomMaxCount) {
            this.createAiSnake();
        }
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
        this.clientFrameCount += 1;
    }
    // 初始化一条Ai蛇
    createAiSnake() {
        const gameId = this.clientFrameCount;
        const initLength = gameContext.getRandomInt(5, 15);
        const aiSnakeData = { // 玩家数据(要包括自己的数据)
            gameId: gameId,
            userId: 233,
            name: `AI${gameId}`, // 玩家名字
            snakeData: [], // 蛇的数据
            teamId: '', // 组队id
            score: 0, // 分数
            aiNumber: 2323, // '' ai的编号
        };
        for(let i = 0; i < initLength; i ++) {
            aiSnakeData.snakeData.push(cc.v2(500 - i * 10, 100));
        }
        this.createSnake(aiSnakeData);
    }
    // 重置
    public resetMap() {
        // console.log(1)
        // this.snakeContainer.children.forEach(child => {
        //     this.snakePool.put(child);
        //     child.parent = null;
        //     child.active = false;
        // });
        // this.snakeContainer.removeAllChildren();
        // this.fo
        // this.foodContainer.removeAllChildren();
    }
}
