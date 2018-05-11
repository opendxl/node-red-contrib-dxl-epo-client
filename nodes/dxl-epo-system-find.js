'use strict'

var Util = require('../lib/util')

var EPO_SYSTEM_FIND_REMOTE_COMMAND = 'system.find'

module.exports = function (RED) {
  function EpoSystemFindNode (nodeConfig) {
    RED.nodes.createNode(this, nodeConfig)

    /**
     * Handle to the DXL client node used to make requests to the DXL fabric.
     * @type {Client}
     * @private
     */
    this._client = RED.nodes.getNode(nodeConfig.client)

    var node = this

    this.status({
      fill: 'red',
      shape: 'ring',
      text: 'node-red:common.status.disconnected'
    })

    if (node._client) {
      node._client.registerUserNode(this)
      this.on('input', function (msg) {
        msg.command = EPO_SYSTEM_FIND_REMOTE_COMMAND
        msg.payload = {
          searchText: msg.payload || '',
          searchNameOnly: nodeConfig.searchNameOnly ? 1 : 0
        }
        Util.runEpoCommand(node, msg, this._client.dxlClient, nodeConfig)
      })
      this.on('close', function (done) {
        node._client.unregisterUserNode(node, done,
          nodeConfig.returnType, nodeConfig.outputFormat)
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

  RED.nodes.registerType('dxl-epo-system-find', EpoSystemFindNode)
}
