import gameContext from '../gameContext';
import BaseScene from '../../scene/BaseScene';
import SnakeController from '../element/snake/SnakeController';
import MapController from '../element/map/MapController';
const {ccclass, property} = cc._decorator;

@ccclass
export default class BaseGameScene extends BaseScene {
    @property({
        type: cc.Prefab,
        tooltip: '手柄',
    })
    handlePrefab = null;
    
    @property({
        type: cc.Prefab,
        tooltip: '地图',
    })
    mapPrefab = null;

    @property({
        type: cc.Prefab,
        tooltip: 'camera摄影师',
    })
    cameraPrefab = null;

    protected gameContext = gameContext;
    protected gameId; // 玩家的gameId
    protected idControllerMap = {}; // gameId与SnakeController的对照表
    protected cameraController = null; // 地图控制器
    protected mapController: MapController = null; // 地图控制器
    protected handController = null; // 手柄控制器
    protected controllDeg = 0; // 本蛇的控制角度
    protected isQuickSpeed = false; // 本蛇的是否加速
    protected needModules(ModuleDef?: any) {
        const { NetModule, CmdModule } = ModuleDef;
        return [NetModule, CmdModule];
    }
    OnLoad() {
        if (!this.handlePrefab || !this.cameraPrefab || !this.mapPrefab) {
            this.LogError('handle or camera or map prefab not exit');
            return;
        }
        const map = cc.instantiate(this.mapPrefab);
        this.mapController = map.getComponent('MapController');
        this.node.addChild(map);

        const canvasParent = this.node.parent;
        const camera = cc.instantiate(this.cameraPrefab);
        this.cameraController = camera.getComponent('CameraController');
        this.cameraController.setMapTarget(map);
        canvasParent.addChild(camera);

        const handle = cc.instantiate(this.handlePrefab);
        this.handController = handle.getComponent('HandleController');
        canvasParent.addChild(handle);
    }
    start() {
        // 每过30ms从游戏管理器拿到命令进行渲染。有可能一次性拿到很多，进行循环处理
        if (!this.cameraController) {
            this.LogError('camera控制器不存在');
            return;
        }
        if (!this.mapController) {
            this.LogError('map控制器不存在');
            return;
        }
        if (!this.handController) {
            this.LogError('手柄控制器不存在');
            return;
        }
        this.cameraController.addTarget(this.node);
        this.listener();
        this.OnStart();
    }
    OnStart() {
        this.Log('rewrite OnStart to init game');
    }
    OnSelfSnakeDie() {}
    TickUpdate() {}
    // 当数据加载完成时(通过初始化的房间数据来初始化游戏)
    protected onLoadRoomData(roomData) {
        this.gameId = roomData.gameId;
        this.gameContext.roomData = roomData;
        // 通过roomData创建游戏视图
        this.createSnakesByPlaysData(roomData.playsData);
        this.startGame();
    }
    // 开始游戏(当初始化数据都加载好的时候)
    protected startGame() {
        this.setMapAutoFollow();
        this.setTick();
    }
    // 当自己的蛇死掉的时候
    private onSelfSnakeDie() {
        this.cancelMapAutoFollow(); // (释放内存)
        this.onCancelQuick(); // 取消加速
        this.OnSelfSnakeDie();
    }
    
    // 取消地图跟随
    protected cancelMapAutoFollow() {
        this.cameraController.setFollowTarget(null);
    }
    // 设置地图自动跟随
    protected setMapAutoFollow() {
        if (!this.idControllerMap[this.gameId] || !this.idControllerMap[this.gameId].headerControll) {
            this.Log('用户的SnakeHead节点不存在');
            return;
        }
        const userSnake = this.idControllerMap[this.gameId].headerControll.node;
        this.cameraController.setFollowTarget(userSnake);
    }
    // 通过playsData创建节点SnakeController,并建立关系对照表
    protected createSnakesByPlaysData(playsData: any[]) {
        playsData.forEach((data) => {
            const { gameId, userId, name, snakeData, teamId, score, aiNumber } = data;
            const snakeController: SnakeController = this.mapController.createSnake(data);
            this.idControllerMap[gameId] = snakeController;
        });
    }
    // 设置逻辑循环
    setTick() {
        this.stopTickUpdate(); // 防止重复
        this.schedule(this.tickUpdate, this.gameContext.tickTime / 1000);
    }
    tickUpdate() {
        this.TickUpdate();
    }
    
    // 停止发送玩家命令(对于单机，停止游戏，对于联机中止玩家输出，其他玩家的操作还在继续)
    protected stopTickUpdate() {
        this.unschedule(this.tickUpdate);
    }
    // 监听事件
    listener() {
        this.removeListener();
        const CmdModule = this.moduleManage.CmdModule;
        CmdModule.on(CmdModule.EventType.receiveCmd, this.tickLogic, this);
        // 当蛇杀死其他蛇时
        const EventType = this.gameContext.EventType;
        this.node.on(EventType.onSnakeKillOtherSnake, this.onSnakeKillOtherSnake, this);
        // 当蛇撞墙死时
        this.node.on(EventType.onKillByWall, this.onSnakekillByWall, this);
        // 手柄控制
        this.handController.node.on(this.handController.EventType.quickController, this.onQuickController, this);
        this.handController.node.on(this.handController.EventType.cancelQuickController, this.onCancelQuick, this);
        this.handController.node.on(this.handController.EventType.dirController, this.onDirController, this);
    }
    // 取消监听
    removeListener() {
        const CmdModule = this.moduleManage.CmdModule;
        CmdModule.off(CmdModule.EventType.receiveCmd);
        const EventType = this.gameContext.EventType;
        this.node.off(EventType.onSnakeKillOtherSnake, this.onSnakeKillOtherSnake);
        this.node.off(EventType.onKillByWall, this.onSnakekillByWall);
        this.handController.node.off(this.handController.EventType.quickController, this.onQuickController);
        this.handController.node.off(this.handController.EventType.cancelQuickController, this.onCancelQuick);
        this.handController.node.off(this.handController.EventType.dirController, this.onDirController);
    }
    // 当有蛇被杀时
    onSnakeKillOtherSnake(ev) {
        const snakeKill: SnakeController = ev.detail.snakeKill;
        const snakeKilled: SnakeController = ev.detail.snakeKilled;
        if (!snakeKill || !snakeKilled) {
            return;
        }
        if (snakeKilled.gameId === this.gameId) {
            this.onSelfSnakeDie();
        }
        delete this.idControllerMap [snakeKilled.gameId];
        // snakeKill, snakeKilled
        this.Log(`${snakeKill.gameId}杀死了${snakeKilled.gameId}`);
    }
    // 当有蛇被墙撞死时
    onSnakekillByWall(ev) {
        const snakeController: SnakeController = ev.detail.snakeKilled;
        if (!snakeController) {
            return;
        }
        const snakeKilledGameId = snakeController.gameId;
        if (snakeKilledGameId === this.gameId) {
            this.onSelfSnakeDie();
        }
        delete this.idControllerMap [snakeKilledGameId];
        this.Log(`${snakeKilledGameId}被墙撞死了`);
    }
    // 进行逻辑处理（只进行渲染和游戏帧率控制，就是说用这个函数可以进行加速播放和断线重连等操作）
    // 其中渲染的结果之和命令有关(每一条命令就可以进行一次帧渲染),与服务器逻辑分开，不依赖服务器
    tickLogic(cmd: string) {
        this.gameContext.tickUpdate(cmd);
        this.mapController.updateMap();
        const playerCmds = this.moduleManage.CmdModule.resolveCmds(cmd);
        playerCmds.forEach(data => {
            const { gameId, deg, isQuick} = data;
            if (this.idControllerMap[gameId]) {
                this.idControllerMap[gameId].controllDeg = deg;
                this.idControllerMap[gameId].isQuickSpeed = isQuick;
            }
        });
    }
    // 当用户进行控制时(夹角弧度)
    onDirController(ev) {
        const { dirRad } = ev.detail;
        this.controllDeg = this.gameContext.getDegByRad(dirRad);
    }
    // 当用户进行加速时
    onQuickController() {
        this.isQuickSpeed = true;
    }
    // 取消加速
    onCancelQuick() {
        this.isQuickSpeed = false;
    }
}

