'use strict'

var MessageUtils = require('@opendxl/node-red-contrib-dxl').MessageUtils
var EpoClient = require('@opendxl/dxl-epo-client').EpoClient

module.exports = function (RED) {
  function EpoThreatEventInNode (nodeConfig) {
    RED.nodes.createNode(this, nodeConfig)

    /**
     * Handle to the DXL client node used to make requests to the DXL fabric.
     * @type {Client}
     * @private
     */
    this._client = RED.nodes.getNode(nodeConfig.client)

    this._payloadType = nodeConfig.payloadType || 'obj'

    var node = this

    this.status({
      fill: 'red',
      shape: 'ring',
      text: 'node-red:common.status.disconnected'
    })

    if (this._client) {
      this._client.registerUserNode(this)
      var epoClient = new EpoClient(this._client.dxlClient)
      var callback = function (threatEventObj) {
        var msg = {payload: MessageUtils.objectToReturnType(threatEventObj,
          node._payloadType)}
        node.send(msg)
      }
      epoClient.addThreatEventCallback(callback, nodeConfig.topic)
      this.on('close', function (done) {
        epoClient.removeThreatEventCallback(callback, nodeConfig.topic)
        node._client.unregisterUserNode(node, done)
      })
      if (this._client.connected) {
        this.status({
          fill: 'green',
          shape: 'dot',
          text: 'node-red:common.status.connected'
        })
      }
    } else {
      this.error('Missing client configuration')
    }
  }

  RED.nodes.registerType('dxl-epo-threat-event in', EpoThreatEventInNode)
}
