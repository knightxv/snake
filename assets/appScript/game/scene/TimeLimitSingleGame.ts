import BaseGameScene from './BaseGameScene';
import CmdModule from '../../core/module/business/CmdModule';
const {ccclass, property} = cc._decorator;

@ccclass
export default class TimeLimitSingleGame extends BaseGameScene {
    OnStart() {
        this.showLoading();
        const NetModule = this.moduleManage.NetModule
        NetModule.once(NetModule.Event.onGameStart, (initData) => {
            this.hideLoading();
            // this.loadGameData();
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
            this.onLoadPlayerData(playsData);
            this.moduleManage.CmdModule.serverInit();
        });
    }
    TickUpdate() {
        // 应该改成30ms发送一次请求的
        this.moduleManage.CmdModule.sendCmdToServer(this.controllDeg, this.isQuickSpeed);
    }
    // 发送复活命令给服务器
    reliveSelf() {
        this.moduleManage.NetModule.reliveSnake(this.gameId);
    }
    // 退出游戏
    quitGame() {
        this.moduleManage.CmdModule.removeNetServer();
        this.moduleManage.NetModule.quitGame();
        this.moduleManage.SceneModule.EnterMain();
    }
    OnSelfSnakeRelive() {
        const dieBox = cc.find('reliveTipBox', this.node.parent);
        if (dieBox) {
            dieBox.active = false;
        }
    }
    OnSelfSnakeDie() {
        // cc.log('self snake die -> 弹出提示操作(立即复活)');
        const dieBox = cc.find('reliveTipBox', this.node.parent);
        dieBox.zIndex = 999;
        if (dieBox) {
            dieBox.active = true;
        }
    }
}
