import BaseGameScene from './BaseGameScene';
const {ccclass, property} = cc._decorator;

@ccclass
export default class TimeLimitSingleGame extends BaseGameScene {
    OnStart() {
        this.loadGameData();
    }
    private _roomData: any = {};
    // 加载游戏数据(先发送请求要匹配，然后游戏返回房间号和房间的数据。然后通过这些数据加载游戏资源)
    private loadGameData() {
        // 加载完后就开始游戏进度
        const roomData = {
            roomId: 23,
            gameId: 1, // 我自己的玩家id
            playsData: [ // 玩家数据(要包括自己的数据)
                {
                    gameId: 1,
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
                    score: 0, // 分数
                    aiNumber: null, // '' ai的编号
                },
            ],
        };
        this._roomData = roomData;
        this.onLoadRoomData(roomData);  
    }
    TickUpdate() {
        // 单人模式下
        // this.moduleManage.CmdModule.sendCmdToServer(this.controllDeg, this.isQuickSpeed);
        const userCmd = this.moduleManage.CmdModule.InduceCmd(this.controllDeg, this.isQuickSpeed);
        this.moduleManage.NetModule.sendCmd(userCmd);
    }
    OnSelfSnakeDie() {
        // cc.log('self snake die -> 弹出提示操作(立即复活)');
    }
}
