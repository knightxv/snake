/*  用户命令管理器
    * 对用户的命令和接受命令进行处理（用它来触发游戏帧的执行，可以借由它来进行加速和断线重新等操作）
    把从服务器拿到命令推给游戏管理器(做一层过滤)
    网络正常只有一条，如果由多条的话就要进行加速 [1:30!&3:10&4:80, 1:30!&3:10&4:80, ... ]
    
*/
enum CmdEventType {
    receiveCmd = 'receiveCmd',
}
export default class CmdModule {
    // 当收到服务器的命令时 ['1:30!&3:10&4:80', ...]
    public EventType = CmdEventType;
    private eventMap = {};
    // 发送命令给服务区
    sendCmdToServer(deg: number, isQuick: boolean) {
        // 调用Net模块发送命令(如果是联机模式的话)
    }
    // 发送命令给客户端
    sendCmdToClient(gameId, deg: number, isQuick: boolean) {
        this.emit(CmdEventType.receiveCmd, `${gameId}:${deg}${isQuick ? '!': ''}`);
    }
    emit(eventType, ...arg) {
        if (this.eventMap[eventType]) {
            this.eventMap[eventType].forEach(callback => {
                callback(...arg);
            });
        }
    }
    on(eventType, cb) {// 212:30
        if (!this.eventMap[eventType]) {
            this.eventMap[eventType] = [];
        }
        this.eventMap[eventType].push(cb);
    }
    //  解析命令 1:30!&3:10&4:80,
    public resolveCmds(cmd: string): any[] {
        if (!cmd || !/\w+:\w+!?/.test(cmd)) {
            // c('收到的命令为' + cmd);
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

}
