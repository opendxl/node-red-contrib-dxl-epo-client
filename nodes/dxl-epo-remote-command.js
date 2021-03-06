/**
 * @module DxlEpoRemoteCommand
 * @description Implementation of the `dxl-epo-remote-command` node
 * @private
 */

'use strict'

var NodeUtils = require('@opendxl/node-red-contrib-dxl').NodeUtils
var Util = require('../lib/util')

module.exports = function (RED) {
  /**
   * @classdesc Node which invokes an ePO remote command.
   * @param {Object} nodeConfig - Configuration data which the node uses.
   * @param {String} nodeConfig.client - Id of the DXL client configuration node
   *   that this node should be associated with.
   * @param {String} [nodeConfig.command] - The name of the remote command to
   *   invoke. If an empty value is set for this parameter, the value in the
   *   `msg.command` parameter is used instead of the value in this parameter.
   * @param {String} [nodeConfig.epoUniqueId] - The unique identifier used to
   *   specify the ePO server that this client will communicate with.
   * @param {String} [nodeConfig.returnType=obj] - Controls the data type for
   *   the remote command response payload, set as `msg.payload`. If
   *   returnType is 'bin', `msg.payload` is a raw binary Buffer. If returnType
   *   is 'txt', `msg.payload` is a String (decoded as UTF-8). If returnType is
   *   'obj', is an Object (decoded as a JSON document from the original
   *   payload). If an error occurs when attempting to convert the binary
   *   Buffer of the payload into the desired data type, the current flow is
   *   halted with an error.
   * @private
   * @constructor
   */
  function EpoRemoteCommandNode (nodeConfig) {
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
        Util.runEpoCommand(node, msg,
          NodeUtils.extractProperty(msg, 'command'),
          this._client.dxlClient, nodeConfig, msg.payload)
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

  RED.nodes.registerType('dxl-epo-remote-command', EpoRemoteCommandNode)
}
