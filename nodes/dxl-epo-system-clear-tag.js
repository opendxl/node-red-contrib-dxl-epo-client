'use strict'

var Util = require('../lib/util')

var EPO_SYSTEM_CLEAR_TAG_REMOTE_COMMAND = 'system.clearTag'

module.exports = function (RED) {
  function EpoSystemClearTag (nodeConfig) {
    RED.nodes.createNode(this, nodeConfig)

    this._tag = nodeConfig.tag

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
        msg.tag = msg.tag || node._tag
        if (msg.payload && msg.tag) {
          if (typeof msg.payload === 'object' && msg.payload.join) {
            msg.payload = msg.payload.join(',')
          }
          msg.command = EPO_SYSTEM_CLEAR_TAG_REMOTE_COMMAND
          msg.payload = {
            names: msg.payload,
            tagName: msg.tag
          }
          Util.runEpoCommand(node, msg, this._client.dxlClient, nodeConfig)
        } else if (!msg.payload) {
          node.error('System names were not specified in payload')
        } else {
          node.error('Tag was not specified')
        }
      })
      this.on('close', function (done) {
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

  RED.nodes.registerType('dxl-epo-system-clear-tag', EpoSystemClearTag)
}
