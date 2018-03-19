import BaseGameScene from './BaseGameScene';
const {ccclass, property} = cc._decorator;

// 无尽模式
@ccclass
export default class EndLessGame extends BaseGameScene {
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
        this.moduleManage.CmdModule.sendCmdToClient(this.gameId, this.controllDeg, this.isQuickSpeed);
    }
    OnSelfSnakeDie() {
        // 单机模式(花不花钱，主要在于新生成的蛇会不会保留数组而已)
        cc.log('self snake die -> 弹出提示操作(花钱立即复活，不花钱重新开始)');
        // 重新开始 
        // this.scheduleOnce(() => {
        //     this.reStartGame(this._roomData);
        // }, 1);
        // 开始新游戏
        // this.scheduleOnce(() => {
        //     this.reStartNewGame(this._roomData);
        // }, 1);
    }
}
