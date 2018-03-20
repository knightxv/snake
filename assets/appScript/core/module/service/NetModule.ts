import pomelo from '../../../core/lib/pomelo';
/*
pomelo.init({
    host : host1,
    port : port1
}, function () {
    var route = 'gate.gateHandler.queryEntry';
    pomelo.request(route, {
    }, function () {
        pomelo.disconnect(function () {
            pomelo.init({
                host : host2,
                port : port2,
                reconnect : true
            }, function () {
            })
        });
    })
    
});

*/

export default class NetModule {
    pomelo: any;
    constructor() {
        this.pomelo = pomelo;
        if (this.pomelo) {
            this.init();
        }
    }
    init() {
        const pomelo = this.pomelo;
        const uid = 'knight';
        const host = '127.0.0.1'; // window.location.hostname
        const port = "3010";
        pomelo.init({
            host: host,
            port: port,
            log: true
          }, function() {
            pomelo.request("snake.roomHandle.entry", {}, function(data) {
                cc.log(data);
            });
          });
    }
    sendCmd(cmd) {
        // console.log(`发送命令给服务器:${cmd}`);
        // console.log(pomelo)
    }
    on(eventType: string, cb: Function) {

    }
    off(eventType: string) {

    }
}
