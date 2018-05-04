'use strict'

var epo = require('@opendxl/dxl-epo-client')
var EpoClient = epo.EpoClient

module.exports = function (RED) {
  function EpoThreatEventInNode (nodeConfig) {
    RED.nodes.createNode(this, nodeConfig)

    /**
     * Handle to the DXL client node used to make requests to the DXL fabric.
     * @type {Client}
     * @private
     */
    this._client = RED.nodes.getNode(nodeConfig.client)

    this._topic = nodeConfig.topic

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
        var msg = {payload: threatEventObj}
        node.send(msg)
      }
      epoClient.addThreatEventCallback(callback, node._topic)
      this.on('close', function (done) {
        epoClient.removeThreatEventCallback(callback)
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
