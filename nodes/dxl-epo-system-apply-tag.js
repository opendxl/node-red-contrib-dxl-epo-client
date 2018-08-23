/**
 * @module DxlEpoSystemApplyTag
 * @description Implementation of the `dxl-epo-system-apply-tag` node
 * @private
 */

'use strict'

var NodeUtils = require('@opendxl/node-red-contrib-dxl').NodeUtils
var Util = require('../lib/util')

var EPO_SYSTEM_APPLY_TAG_REMOTE_COMMAND = 'system.applyTag'

module.exports = function (RED) {
  /**
   * @classdesc Node which invokes the ePO 'system.applyTag' command.
   * @param {Object} nodeConfig - Configuration data which the node uses.
   * @param {String} nodeConfig.client - Id of the DXL client configuration node
   *   that this node should be associated with.
   * @param {String} [nodeConfig.tagName] - The name of the tag to apply. If an
   *    empty value is set for this parameter, the value in the `msg.tagName`
   *    parameter is used instead of the value in this parameter.
   * @param {String} [nodeConfig.epoUniqueId] - The unique identifier used to
   *   specify the ePO server that this client will communicate with.
   * @param {String} [nodeConfig.returnType=obj] - Controls the data type for
   *   the remote command response payload, set as `msg.payload`. If
   *   returnType is 'bin', `msg.payload` is raw binary Buffer. If returnType
   *   is 'txt', `msg.payload` is a String (decoded as UTF-8). If returnType is
   *   'obj', is an Object (decoded as a JSON document from the original
   *   payload). If an error occurs when attempting to convert the binary
   *   Buffer of the payload into the desired data type, the current flow is
   *   halted with an error.
   * @constructor
   */
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
            this._client.dxlClient, nodeConfig,
            {names: names, tagName: tagName}
          )
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
