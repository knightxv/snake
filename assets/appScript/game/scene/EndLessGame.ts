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
    // 重新开始新游戏
    private reStartNewGame(playsData) {
        this.idControllerMap = {};
        this.mapController.resetMap();
        this.onLoadPlayerData(playsData);
    }
    // 当自己的蛇死掉的时候
    OnSelfSnakeDie() {
        const isReStart = window.confirm('是否重新开始游戏');
        if (isReStart) {
            this.reStartNewGame(this._playsData);
        } else {
            // 退出游戏(查看资源是否释放)
            this.moduleManage.SceneModule.EnterMain();
        }
    }
}
