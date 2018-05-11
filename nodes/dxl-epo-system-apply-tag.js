'use strict'

var NodeUtils = require('@opendxl/node-red-contrib-dxl').NodeUtils
var Util = require('../lib/util')

var EPO_SYSTEM_APPLY_TAG_REMOTE_COMMAND = 'system.applyTag'

module.exports = function (RED) {
  function EpoSystemApplyTag (nodeConfig) {
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
        var tag = NodeUtils.defaultIfEmpty(nodeConfig.tag, msg.tag)
        if (msg.payload && tag) {
          if (typeof msg.payload === 'object' && msg.payload.join) {
            msg.payload = msg.payload.join(',')
          }
          msg.command = EPO_SYSTEM_APPLY_TAG_REMOTE_COMMAND
          msg.payload = {
            names: msg.payload,
            tagName: tag
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

  RED.nodes.registerType('dxl-epo-system-apply-tag', EpoSystemApplyTag)
}
