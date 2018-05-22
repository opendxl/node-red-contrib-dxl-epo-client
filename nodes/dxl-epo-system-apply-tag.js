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
        var names = NodeUtils.extractProperty(msg, 'names')
        var tagName = NodeUtils.defaultIfEmpty(nodeConfig.tagName,
          NodeUtils.extractProperty(msg, 'tagName'))
        if (names && tagName) {
          if (typeof names === 'object' && names.join) {
            names = names.join(',')
          }
          Util.runEpoCommand(node, msg, EPO_SYSTEM_APPLY_TAG_REMOTE_COMMAND,
            {names: names, tagName: tagName},
            this._client.dxlClient, nodeConfig)
        } else if (!names) {
          node.error('names property was not specified')
        } else {
          node.error('tagName property was not specified')
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
