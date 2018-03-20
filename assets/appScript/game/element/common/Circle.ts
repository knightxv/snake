
const {ccclass, property} = cc._decorator;

@ccclass
export default class Circle extends cc.Component {
    @property({
        tooltip: '圆的填充颜色',
    })
    circleColor = new cc.Color();

    @property({
        type: cc.Integer,
        tooltip: '圆的半径'
    })
    circlrRad = 10;
    onLoad() {
        const ctx = this.node.addComponent(cc.Graphics);
        ctx.circle(0, 0, this.circlrRad);
        ctx.fillColor = this.circleColor;
        ctx.fill();
    }

}
