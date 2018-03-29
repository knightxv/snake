import BaseGameScene from './BaseGameScene';
const {ccclass, property} = cc._decorator;

@ccclass
export default class TimeLimitSingleGame extends BaseGameScene {
    OnStart() {
        const NetModule = this.moduleManage.NetModule
        NetModule.once(NetModule.Event.onGameStart, (initData) => {
            // this.loadGameData();
            console.log('on gameStart')
            console.log(initData)
            const { roomId, randomSeed, playsData, aiMenbers } = initData;
            const userInfo = this.moduleManage.LocalStroageModule.getUserInfo();
            const localUid = userInfo ? userInfo.uid : '';
            let userGameId; // 用户的gameId
            playsData.some(playInfo => {
                const { gameId, uid } = playInfo;
                if (uid == localUid) {
                    userGameId = gameId;
                    return true;
                }
                return false;
            });
            if (typeof userGameId === 'undefined') {
                this.LogError('游戏数据中找不到本地玩家id');
                return;
            }
            this.gameContext.gameId = userGameId;
            this.gameContext.roomId = roomId;
            this.gameContext.randomSeed = randomSeed;
            this.createAiMenbers(aiMenbers || []);
            this.onLoadPlayerData(playsData);
            this.moduleManage.CmdModule.serverInit();
        });
    }
    TickUpdate() {
        // 单人模式下
        this.moduleManage.CmdModule.sendCmdToServer(this.controllDeg, this.isQuickSpeed);
    }
    OnSelfSnakeDie() {
        // cc.log('self snake die -> 弹出提示操作(立即复活)');
    }
}
