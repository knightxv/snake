
const {ccclass, property} = cc._decorator;

@ccclass
export default class CameraController extends cc.Component {
    @property(cc.Node)
    map = null;

    private target: cc.Node | null = null;
    // 设置跟随节点
    setFollowTarget(tarNode: cc.Node) {
        this.target = tarNode;
    }
    lateUpdate() {
        let pos = cc.v2();
        // 跟随target
        if (this.target) {
            let targetPos = this.target.convertToWorldSpaceAR(cc.Vec2.ZERO);
            pos = this.node.parent.convertToNodeSpaceAR(targetPos);
        }
        // 限制在map中
        if (this.map) {
            const worldPos = this.map.convertToWorldSpace(cc.Vec2.ZERO);
            const { width, height } = this.map;
            const { width: winWidth, height: winHeight } = cc.director.getWinSize();
            const minX = worldPos.x + winWidth / 2;
            const minY = worldPos.y + winHeight / 2;
            const maxX = minX + width - winWidth;
            const maxY = minY + height - winHeight;
            if (pos.x < minX) {
                pos.x = minX;
            }
            if (pos.x > maxX) {
                pos.x = maxX;
            }
            if (pos.y < minY) {
                pos.y = minY;
            }
            if (pos.y > maxY) {
                pos.y = maxY;
            }
            this.node.position = pos;
        }
    }
}
