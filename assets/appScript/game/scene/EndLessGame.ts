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
        // 玩家数据(要包括自己的数据)(单机模式下,玩家数据只有1)
        const playsData = [
            {
                gameId: 0,
                uid: 3434,
                name: 'knight', // 玩家名字
            },
        ];
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
        cc.log('self snake die -> 弹出提示操作(点击重新开始)');
        // 重新开始(暂时不实现这个功能)
        // this.scheduleOnce(() => {
        //     this.reStartGame(this._playsData);
        // }, 1);
        // 开始新游戏
        // this.scheduleOnce(() => {
        //     this.reStartNewGame(this._playsData);
        // }, 1);
    }
}
