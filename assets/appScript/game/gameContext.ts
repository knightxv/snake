
enum SnakePart {
    head = 'head',
    body = 'body',
    tail = 'tail',
};

class NodePool {
    constructor(prefabPath: string) {
        this.prefabPath = prefabPath;
        this.pool = new cc.NodePool();
    }
    private prefabPath: string = '';
    private pool: cc.NodePool;
    
    get() {
        const self = this;
        return new Promise(resolve => {
            if (self.pool.size() > 0) {
                resolve(self.pool.get());
                return;
            }
            cc.loader.loadRes(self.prefabPath, (err, prefab) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(cc.instantiate(prefab));
            })
        });
    }
    put(node: cc.Node) {
        this.pool.put(node);
    }
}

// 游戏的上下文(提供一些全局的东西)
class GameContext {
    public tickTime = 30; // 游戏逻辑触发事件(每30ms游戏进行一次)
    public snakeNodeRadius: number = 5; // 每个骨骼节点的半径
    public normalSpeed: number = 10; // 蛇正常的移动速度
    public quickSpped: number = 20; // 蛇加速的移动速度
    // 精度处理
    public reducePrecision(dig: number): number {
        return Math.floor(dig * 10000)/ 10000;
    }
    // 通过角度来获取下一步该增加的位移(30ms后会增加位移)
    getDisPosByDeg(deg: number, isQuick: boolean = false): cc.Vec2 {
        const nextHeadRadius = Math.PI / 180 * deg;
        const speed = isQuick ? this.quickSpped : this.normalSpeed;
        const disX = this.reducePrecision(Math.cos(nextHeadRadius));
        const disY = this.reducePrecision(Math.sin(nextHeadRadius));
        return cc.v2(disX, disY).mul(speed);
    }
    // prafab池字典
    private prefabPoolMap = {

    };
    public tickUpdate(cmd) {

    }
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
