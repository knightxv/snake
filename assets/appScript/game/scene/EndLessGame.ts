import BaseGameScene from './BaseGameScene';
const {ccclass, property} = cc._decorator;

// 无尽模式
@ccclass
export default class EndLessGame extends BaseGameScene {
    OnStart() {
        this.loadGameData();
    }
    private _playsData: any = {};
    // 加载游戏数据(先发送请求要匹配，然后游戏返回房间号和房间的数据。然后通过这些数据加载游戏资源)
    private loadGameData() {
        // 加载完后就开始游戏进度
        const userGameId = 0;
        this.gameContext.gameId = userGameId;
        this.gameId = userGameId;
        this.gameContext.roomId = 0;
        const playsData = [ // 玩家数据(要包括自己的数据)
            {
                gameId: 0,
                uid: 3434,
                name: 'knight', // 玩家名字
                snakeData: [
                    {
                        x: 500,
                        y: 50,
                    },
                    {
                        x: 490,
                        y: 50,
                    },
                    {
                        x: 480,
                        y: 50,
                    },
                    {
                        x: 470,
                        y: 50,
                    },
                ], // 蛇的数据
            },
        ];
        this.gameContext.isAutoCreateAi = true;
        this._playsData = playsData;
        this.onLoadPlayerData(playsData);  
    }
    TickUpdate() {
        // 单人模式下
        this.moduleManage.CmdModule.sendCmdToClient(this.controllDeg, this.isQuickSpeed);
    }
    // 复活继续这场游戏
    reStartGame(playsData) {
        if (!playsData) {
            this.LogError('初始化数据不能为空');
            return;
        }
        this.onLoadPlayerData(playsData);
    }
    // // 暂停游戏
    // private stopGame() {
    //     this.stopTickUpdate(); // 停止发送命令。
    // }
    // 重新开始新游戏
    private reStartNewGame(playsData) {
        this.idControllerMap = {};
        this.mapController.resetMap();
        this.onLoadPlayerData(playsData);
    }
    OnSelfSnakeDie() {
        // 单机模式(花不花钱，主要在于新生成的蛇会不会保留数组而已)
        cc.log('self snake die -> 弹出提示操作(花钱立即复活，不花钱重新开始)');
        // 重新开始 
        // this.scheduleOnce(() => {
        //     this.reStartGame(this._playsData);
        // }, 1);
        // 开始新游戏
        // this.scheduleOnce(() => {
        //     this.reStartNewGame(this._playsData);
        // }, 1);
    }
}
