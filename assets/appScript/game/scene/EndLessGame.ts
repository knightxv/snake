import BaseGameScene from './BaseGameScene';
import SnakeController from '../snake/SnakeController';
const {ccclass, property} = cc._decorator;

@ccclass
export default class EndLessGame extends BaseGameScene {
    @property({
        type: cc.Prefab,
        tooltip: 'snake节点',
    })
    snakePrefab = null;
    
    private gameId; // 玩家的gameId
    private snakeContainer: cc.Node = null;
    private idControllerMap = {}; // gameId与SnakeController的对照表
    private cameraController = null; // 地图控制器
    protected needModules(ModuleDef?: any) {
        const { NetModule, CmdModule } = ModuleDef;
        return [NetModule, CmdModule];
    }
    OnLoad() {
        // 每过30ms从游戏管理器拿到命令进行渲染。有可能一次性拿到很多，进行循环处理
        this.snakeContainer = this.node.getChildByName('SnakeContainer');
        if (!this.snakeContainer) {
            this.LogError('snakeContainer节点不存在');
            return;
        }
        if (!this.snakePrefab) {
            this.LogError('snakePrefab资源不存在');
            return;
        }
        const camera = cc.find('camera');
        this.cameraController = camera.getComponent('CameraController');
        if (!this.cameraController) {
            this.LogError('camera控制器不存在');
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
                        {
                            x: 460,
                            y: 0,
                        },
                        {
                            x: 450,
                            y: 0,
                        },
                        {
                            x: 440,
                            y: 0,
                        },
                        {
                            x: 430,
                            y: 0,
                        },
                        {
                            x: 420,
                            y: 0,
                        },
                        {
                            x: 410,
                            y: 0,
                        },
                    ], // 蛇的数据
                    teamId: '', // 组队id
                    score: 12, // 分数
                    aiNumber: 2323, // '' ai的编号
                },
            ],
        };
        // 通过roomData创建游戏视图
        this.createSnakesByPlaysData(roomData.playsData);
        this.startGame();
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
            this.gameId = gameId;
            const snakeNode: cc.Node = cc.instantiate(this.snakePrefab);
            const SnakeController = snakeNode.getComponent('SnakeController');
            SnakeController.init(data);
            this.idControllerMap[gameId] = SnakeController;
            this.node.addChild(snakeNode);
        });
    }
    // 开始游戏(当初始化数据都加载好的时候)
    private startGame() {
        this.setMapAutoFollow();
        this.setTick();
        this.listener();
    }
    // 设置逻辑循环
    setTick() {
        this.schedule(() => {
            // 先把玩家信息传给服务器
            this.moduleManage.CmdModule.sendCmd(this.controllDeg, this.isQuickSpeed);
        }, this.gameContext.tickTime / 1000);
    }
    // 监听事件
    listener() {
        const CmdModule = this.moduleManage.CmdModule;
        CmdModule.on(CmdModule.EventType.receiveCmd, (cmd: string) => {
            this.tickLogic(cmd);
        });
    }
    // 进行逻辑处理（只进行渲染和游戏帧率控制，就是说用这个函数可以进行加速播放和断线重连等操作）
    // 其中渲染的结果之和命令有关(每一条命令就可以进行一次帧渲染),与服务器逻辑分开，不依赖服务器
    tickLogic(cmd: string) {
        this.gameContext.tickUpdate(cmd);
        const playerCmds = this.resolveCmds(cmd);
        playerCmds.forEach(data => {
            const { gameId, deg, isQuick} = data;
            this.idControllerMap[gameId] &&this.idControllerMap[gameId].moveTo(deg, isQuick);
        });
        // 设置跟随
        this.setMapAutoFollow();
    }
    //  解析命令 1:30!&3:10&4:80,
    private resolveCmds(cmd: string): any[] {
        if (!cmd || !/\w+:\w+!?/.test(cmd)) {
            this.LogError('收到的命令为' + cmd);
            return [];
        }
        const splitArr: string[] = cmd.split('&');
        return splitArr.map(splitCmd => {
            return {
                gameId: /\w+/.exec(cmd)[0],
                deg: /\w+:(\w+)/.exec(cmd)[1],
                isQuick: /!/.test(cmd),
            };
        });
    }
    private controllDeg = 0; // 目前用户控制的方向(角度)
    // 当用户进行控制时(夹角弧度)
    onDirController(dirRad) {
        this.controllDeg = this.gameContext.getDegByRad(dirRad);
    }
    private isQuickSpeed = false; // 是否加速
    // 当用户进行加速时
    onQuickController() {
        this.isQuickSpeed = true;
    }
    // 取消加速
    onCancelQuick() {
        this.isQuickSpeed = false;
    }
}
