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
    // protected snakePool = new cc.NodePool();

    public mapFoodCount = 50; // 每个地图的食物个数
    public nodeToDieFoodStep = 5; // 蛇死后每多少个节点生成一次死后食物
    public dieFoodDisRange = 10; // 蛇死后生成的节点偏移的距离范围
    public roomMaxCount = 8; // 每个地图的最大蛇数量（单机模式10人）
    public stepMakeAi = 100; // 每隔多少个30ms产生一次ai
    public wallWidth = 5;

    onLoad() {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        // manager.enabledDebugDraw = true;
        // this.wallContainer = this.node.getChildByName('wallContainer');
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
        // const { width: mapWidth, height: mapHeight } = this.node;
        // this.mapWidth = mapWidth;
        // this.mapHeight = mapHeight;
        // const mapWallLeftPoints = [
        //     cc.v2(0, 0),
        //     cc.v2(0, this.wallWidth),
        //     cc.v2(this.wallWidth, mapHeight),
        //     cc.v2(0, mapHeight),
        // ];
        // const mapWallDownPoints = [
        //     cc.v2(0, 0),
        //     cc.v2(mapWidth, 0),
        //     cc.v2(mapWidth, this.wallWidth),
        //     cc.v2(0, this.wallWidth),
        // ];
        // const mapWallRightPoints = [
        //     cc.v2(mapWidth - this.wallWidth, 0),
        //     cc.v2(mapWidth, 0),
        //     cc.v2(mapWidth, mapHeight),
        //     cc.v2(mapWidth - this.wallWidth, mapHeight),
        // ];
        // const mapWallUpPoints = [
        //     cc.v2(0, mapHeight - this.wallWidth),
        //     cc.v2(mapWidth, mapHeight - this.wallWidth),
        //     cc.v2(mapWidth, mapHeight),
        //     cc.v2(0, mapHeight),
        // ];
        // this.createWall(mapWallLeftPoints);
        // this.createWall(mapWallDownPoints);
        // this.createWall(mapWallRightPoints);
        // this.createWall(mapWallUpPoints);
    }
    // protected wallContainer: cc.Node | null = null;
    protected foodContainer: cc.Node | null = null;
    protected snakeContainer: cc.Node | null = null;
    protected mapWidth = 0;
    protected mapHeight = 0;
    // 得到死掉的蛇节点信息，然后生成食物
    protected createDieFoodBySnakeController(dieSnakeController: SnakeController) {
        const nodePoints = dieSnakeController.getDiePoints();
        nodePoints.forEach((point, i) => {
            if (i % this.nodeToDieFoodStep === 0) {
                // 暂时不偏移，如果向偏移食物距离随机，随机的数据可以由SnakeController产生
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
    }
     // 创建初始化死后食物
     protected createDieFood(pos: cc.Vec2) {
        const foodNode: cc.Node = this.dieFoodPool.get() || cc.instantiate(this.dieFoodPrefab);
        foodNode.group = 'food';
        foodNode.setPosition(pos);
        foodNode.parent = this.foodContainer;
    }
    // // 创建墙体
    // protected createWall(points: cc.Vec2[]) {
    //     const wallNode = new cc.Node('wall');
    //     wallNode.group = 'wall';
    //     const polygonCollider = wallNode.addComponent(cc.PolygonCollider);
    //     polygonCollider.points = points;
    //     this.wallContainer.addChild(wallNode);
    // }
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
        const { width: mapWidth, height: mapHeight } = this.node;
        const foodNode: cc.Node = cc.instantiate(this.foodPrefab);
        const foodController = foodNode.getComponent('FoodController');
        foodController.setSeedId(foodIndex);
        foodController.init(mapWidth, mapHeight);
        foodNode.parent = this.foodContainer;
    }
    // 生成蛇
    createSnake(data) {
        const snakeNode: cc.Node = cc.instantiate(this.snakePrefab);
        const SnakeController = snakeNode.getComponent('SnakeController');
        const { gameId } = data;
        SnakeController.setSeedId(gameId);
        SnakeController.init(data);
        snakeNode.parent = this.snakeContainer;
        return SnakeController;
    }
    // 初始化一条Ai蛇
    createAiSnake(aINumber) {
        const aiSnakeData = {
            gameId: aINumber,
            uid: 233,
            name: `AI${aINumber}`,
            aiNumber: aINumber, // ai的编号
        };
        return this.createSnake(aiSnakeData);
    }
    // 每过一次逻辑帧(拿到地图信息,进行地图食物的生成,把食物生成到一个量级)
    updateMap() {
        // console.log('update map:' + gameContext.clientFrame);
        // 可以利用gameContext的updateTick方法,把判断逻辑抽取到各个组件自行判断。(但是不实现)
        this.snakeContainer.children.forEach(child => {
            const snakeController = child.getComponent(SnakeController);
            const headerControll = snakeController.headerControll;
            if (!headerControll || !child.active) {
                return;
            }
            const { aroundFood, aroundSnakeNode, aroundWall } = headerControll;
            const snakeRadius = gameContext.snakeNodeSkinRadius;
            // const curPos = headerControll.node.parent.convertToWorldSpaceAR(headerControll.getCurrentPos());
            const curPos = headerControll.getCurrentPos();
            // 判断蛇有没有撞墙
            const minX = curPos.x - snakeRadius;
            const maxX = curPos.x + snakeRadius;
            const minY = curPos.y - snakeRadius;
            const maxY = curPos.y + snakeRadius;
            const { width: mapWidth, height: mapHeight } = this.node;
            if (minX <= this.wallWidth || maxX >= mapWidth - this.wallWidth
                || minY <= this.wallWidth || maxY >= mapHeight - this.wallWidth) {
                    snakeController.onCollsionWall();
                } 
            if (snakeController.isAi) {
                const wallWarnDis = 10; // 墙的警戒距离
                if (minX - wallWarnDis <= this.wallWidth || maxX + wallWarnDis >= mapWidth - this.wallWidth
                    || minY - wallWarnDis <= this.wallWidth || maxY + wallWarnDis >= mapHeight - this.wallWidth) {
                        snakeController.avoidDanger();
                }
            }
            // 判断蛇有没有吃食物
            aroundFood.forEach((foodControl: FoodController) => {
                const foodPoint = cc.v2(foodControl.node.position);
                const dis = gameContext.reducePrecision(curPos.sub(foodPoint).mag());
                if (dis <= snakeRadius + foodControl.radius + 5) {
                    snakeController.onEatFood(foodControl);
                }
            });
            // 判断有没有撞到其他蛇
            // 对数组进行排序,使他们的计算顺序一样(也可以改成距离最近的杀死的)
            aroundSnakeNode.sort((controller1, controller2) => {
                if (!controller1.node.parent || !controller2.node.parent) {
                    return -1;
                }
                return controller1.node.parent.getComponent(SnakeController).gameId - controller2.node.parent.getComponent(SnakeController).gameId;
            });
            !snakeController.isSaveState && aroundSnakeNode.some((snakeNodeController) => {
                const nodeWolrldPos = snakeNodeController.node.parent.convertToWorldSpaceAR(snakeNodeController.getCurrentPos());
                const dis = Math.floor(curPos.sub(nodeWolrldPos).mag());
                // console.log(`${snakeController.gameId}->${snakeNodeController.node.parent.getComponent(SnakeController).gameId},dis(${dis})`);
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
                    snakeController.avoidDanger();
                }
                return false;
            });
            // 回收每个死掉的蛇,没死就移动它
            if (snakeController.isKilled) {
                this.createDieFoodBySnakeController(snakeController);
                // 如果使ai死掉直接换个地方复活(玩家的话，要等待按确认之后才复活)
                if (snakeController.isAi) {
                    gameContext.scheduleOnce(() => {
                        snakeController.relive();
                    }, 20);
                }
            } else {
                snakeController.move();
            }
        });
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
        this.snakeContainer.children.forEach(child => {
            const snakeController = child.getComponent(SnakeController);
            snakeController.onDie();
        });
        this.foodContainer.children.forEach(child => {
            const foodController = child.getComponent(FoodController);
            foodController.onEated();
        });
        this.snakeContainer.removeAllChildren()
        this.foodContainer.removeAllChildren();
    }
}
