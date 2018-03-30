
enum SnakePart {
    head = 'head',
    body = 'body',
    tail = 'tail',
};

enum EventType {
    onSnakeKillOtherSnake = 'onSnakeKillOtherSnake', // 当蛇杀死其他蛇时(snakeKill, snakeKilled(被杀者))
    onKillByWall = 'onKillByWall', // 当撞墙死时 (snakeKilled)
    onFoodEated = 'onFoodEated', // 当撞墙死时 (snakeKilled)
    onSnakeDanger = 'onSnakeDanger', // 当蛇碰到危险时 (gameId)
};

// class NodePool {
//     constructor(prefabPath: string) {
//         this.prefabPath = prefabPath;
//         this.pool = new cc.NodePool();
//     }
//     private prefabPath: string = '';
//     private pool: cc.NodePool;
    
//     get() {
//         const self = this;
//         return new Promise(resolve => {
//             if (self.pool.size() > 0) {
//                 resolve(self.pool.get());
//                 return;
//             }
//             cc.loader.loadRes(self.prefabPath, (err, prefab) => {
//                 if (err) {
//                     resolve(null);
//                     return;
//                 }
//                 resolve(cc.instantiate(prefab));
//             })
//         });
//     }
//     put(node: cc.Node) {
//         this.pool.put(node);
//     }
// }

// 游戏的上下文(提供一些全局的东西)
class GameContext {
    // 服务器60ms一次操作cmd(每秒15个响应,这个游戏就不太会卡顿了)
    public tickTime = 60; // 游戏逻辑触发事件(每--ms游戏进行一次)
    public snakeNodeRadius: number = 5; // 每个骨骼节点的半径
    public snakeNodeSkinRadius: number = 16; // 皮肤节点的半径
    public normalSpeed: number = 10; // 蛇正常的移动速度
    public quickSpped: number = 20; // 蛇加速的移动速度
    public EventType = EventType; // 全局事件
    public roomCount = 0; // 房间的总人数
    public roomPlayerCount = 0; // 房间的玩家人数
    public gameId: string | number; // 用户的房间游戏id
    public roomId: string | number; // 房间号
    public randomSeed: string | number = 'test233'; // 随机种子
    public netFrame = 0; // 客户端现在的网络帧
    public clientFrame = 0;
    // 精度处理
    public reducePrecision(dig: number): number {
        return Math.floor(dig * 10000) / 10000;
    }
    private tickCb = [];
    // 更新tick
    public updateTick() {
        this.clientFrame += 1;
        this.tickCb.forEach((tickObj, index) => {
            tickObj.tickCount -= 1;
            if (tickObj.tickCount == 0) {
                tickObj.callBack();
            }
        });
        this.tickCb = this.tickCb.filter(tickObj => tickObj.tickCount != 0);
    }
    // 在tickCount(1->30ms)个逻辑帧之后执行某个函数
    public scheduleOnce(cb, tickCount) { 
        this.tickCb.push({
            callBack: cb,
            tickCount,
        });
    }
    // 通过角度来获取下一步该增加的位移(30ms后会增加位移)
    getDisPosByDeg(deg: number, isQuick: boolean = false): cc.Vec2 {
        const nextHeadRadius = Math.PI / 180 * deg;
        const speed = isQuick ? this.quickSpped : this.normalSpeed;
        const disX = this.reducePrecision(Math.cos(nextHeadRadius));
        const disY = this.reducePrecision(Math.sin(nextHeadRadius));
        return cc.v2(disX, disY).mul(speed);
    }
    // 得到最小到最大的随机整数
    public getRandomInt(min, max) {
        return Math.floor(this.Random() * (max - min + 1) + min);
    }
    // 通过随机种子获取随机数
    public getRandomIntBySeed(min, max, seedrandom) {
        Math.seedrandom(seedrandom);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    public ramdomCount = 0
    public Random() {
        if (this.randomSeed) {
            Math.seedrandom(`${this.randomSeed}${this.ramdomCount}`);
            this.ramdomCount ++;
        }
        return Math.random();
    }
    
    public SnakePart = SnakePart;
    // [id]: {
    //  head: '',
    //  body: '',  
    // }
    private skinIdMap = {};
    // 通过游戏id拿到皮肤prefab地址
    getSkinPrefabById(gameId: number, part: SnakePart): string {
        // if (!this.skinIdMap[gameId]) {
        //     return prefabPath.snakeSkin[part];
        // }
        // return this.skinIdMap[gameId][part];
        return '';
    }
    // 通过弧度等到角度
    getDegByRad(rad: number): number {
        const deg = Math.round(rad * 180 / Math.PI);
        if (deg > 0) {
            return deg;
        }
        return deg + 360;
    }
}

export default new GameContext();


/*
// 从实体工厂中拿到实体对象
    getNodeInFactory(prafabPath, defaultPrefabPath?): Promise<cc.Node | null> {
        return new Promise((resolve, reject) => {
            // 创建prefab工厂   
            if (!this.prefabPoolMap[prafabPath]) {
                this.prefabPoolMap[prafabPath] = new NodePool(prafabPath);
            }
            this.prefabPoolMap[prafabPath].get()
                .then(prefabNode => {
                    // 拿到prafab实例
                    if (prefabNode) {
                        resolve(prefabNode);
                        return;
                    }
                    if (!defaultPrefabPath) {
                        reject('指定的prefab资源不存在');
                        return;
                    }
                    // 拿不到就哪defaultPrefab的实例,再不行就报错了
                    if (!this.prefabPoolMap[defaultPrefabPath]) {
                        this.prefabPoolMap[defaultPrefabPath] = new NodePool(prafabPath);
                    }
                    this.prefabPoolMap[defaultPrefabPath].get().then(defaultPrefab => {
                        if (defaultPrefab) {
                            resolve(defaultPrefab);
                            return;
                        }
                        reject('找不到指定的prefab，并且默认的prefab路径有误');
                    });
                });
        });
    }
*/

