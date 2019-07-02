module.exports = function(RED) {
    function LCDI2C(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function(msg) {
            
        });
    }
    RED.nodes.registerType("LCD-I2C", LCDI2C);
}