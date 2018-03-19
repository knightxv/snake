import BaseGameScene from './BaseGameScene';
import SnakeController from '../element/snake/SnakeController';
import MapController from '../element/map/MapController';
const {ccclass, property} = cc._decorator;

@ccclass
export default class EndLessGame extends BaseGameScene {
    private gameId; // 玩家的gameId
    private snakeContainer: cc.Node = null;
    private idControllerMap = {}; // gameId与SnakeController的对照表
    private cameraController = null; // 地图控制器
    private mapController: MapController = null; // 地图控制器
    private controllDeg = 0; // 本蛇的控制角度
    private isQuickSpeed = false; // 本蛇的是否加速
    protected needModules(ModuleDef?: any) {
        const { NetModule, CmdModule } = ModuleDef;
        return [NetModule, CmdModule];
    }
    start() {
        // 每过30ms从游戏管理器拿到命令进行渲染。有可能一次性拿到很多，进行循环处理
        const camera = cc.find('camera');
        this.cameraController = camera.getComponent('CameraController');
        if (!this.cameraController) {
            this.LogError('camera控制器不存在');
            return;
        }
        const map = cc.find('map', this.node);
        this.mapController = map.getComponent('MapController');
        if (!this.mapController) {
            this.LogError('map控制器不存在');
            return;
        }
        this.loadGameData();
    }
    // 加载游戏数据(先发送请求要匹配，然后游戏返回房间号和房间的数据。然后通过这些数据加载游戏资源)
    private loadGameData() {
        // 加载完后就开始游戏进度
        const roomData = {
            roomId: 23,
            gameId: 212, // 我自己的玩家id
            playsData: [ // 玩家数据(要包括自己的数据)
                {
                    gameId: 212,
                    userId: 3434,
                    name: 'knight', // 玩家名字
                    snakeData: [
                        {
                            x: 500,
                            y: 0,
                        },
                        {
                            x: 490,
                            y: 0,
                        },
                        {
                            x: 480,
                            y: 0,
                        },
                        {
                            x: 470,
                            y: 0,
                        },
                    ], // 蛇的数据
                    teamId: '', // 组队id
                    score: 12, // 分数
                    aiNumber: null, // '' ai的编号
                },
            ],
        };
        this.gameId = roomData.gameId;
        this.gameContext.roomData = roomData;
        // 通过roomData创建游戏视图
        this.createSnakesByPlaysData(roomData.playsData);
        this.startGame();
    }
    // 开始游戏(当初始化数据都加载好的时候)
    private startGame() {
        this.setMapAutoFollow();
        this.setTick();
        this.listener();
    }
    // 重新开始游戏
    protected reStartGame() {
        this.setTick();
    }
    // 当自己的蛇死掉的时候
    onSelfSnakeDie() {
        this.cancelMapAutoFollow(); // (释放内存)
        this.stopSendPlayCmd();

        // 单机模式(花不花钱，主要在于新生成的蛇会不会保留数组而已)
        cc.log('self snake die -> 弹出提示操作(花钱立即复活，不花钱重新开始)');
        // 联机模式
        // cc.log('self snake die -> 弹出提示操作(立即复活)');
    }
    // 取消地图跟随
    private cancelMapAutoFollow() {
        this.cameraController.setFollowTarget(null);
    }
    // 设置地图自动跟随
    private setMapAutoFollow() {
        if (!this.idControllerMap[this.gameId] || !this.idControllerMap[this.gameId].headerControll) {
            this.Log('用户的SnakeHead节点不存在');
            return;
        }
        const userSnake = this.idControllerMap[this.gameId].headerControll.node;
        this.cameraController.setFollowTarget(userSnake);
    }
    // 通过playsData创建节点SnakeController,并建立关系对照表
    private createSnakesByPlaysData(playsData: any[]) {
        playsData.forEach((data) => {
            const { gameId, userId, name, snakeData, teamId, score, aiNumber } = data;
            const snakeController: SnakeController = this.mapController.createSnake(data);
            this.idControllerMap[gameId] = snakeController;
        });
    }
    // 设置逻辑循环
    setTick() {
        this.schedule(this.sendPlayCmdToCmdModule, this.gameContext.tickTime / 1000);
    }
    // 发送命令给cmdModule
    sendPlayCmdToCmdModule() {
        // 多人模式下
        // this.moduleManage.CmdModule.sendCmdToServer(this.controllDeg, this.isQuickSpeed);
        // 单人模式下
        this.moduleManage.CmdModule.sendCmdToClient(this.gameId, this.controllDeg, this.isQuickSpeed);
    }
    // 停止发送玩家命令(对于单机，停止游戏，对于联机中止玩家输出，其他玩家的操作还在继续)
    public stopSendPlayCmd() {
        this.unschedule(this.sendPlayCmdToCmdModule);
    }
    // 监听事件
    listener() {
        const CmdModule = this.moduleManage.CmdModule;
        CmdModule.on(CmdModule.EventType.receiveCmd, (cmd: string) => {
            this.tickLogic(cmd);
        });
        // 当蛇杀死其他蛇时
        const EventType = this.gameContext.EventType;
        this.node.on(EventType.onSnakeKillOtherSnake, this.onSnakeKillOtherSnake, this);
        // 当蛇撞墙死时
        this.node.on(EventType.onKillByWall, this.onSnakekillByWall, this);
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
    onDirController(dirRad) {
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
