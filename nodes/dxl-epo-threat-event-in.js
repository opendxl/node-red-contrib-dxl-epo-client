/**
 * @module DxlEpoThreatEventIn
 * @description Implementation of the `dxl-epo-threat-event in` node
 * @private
 */

'use strict'

var MessageUtils = require('@opendxl/node-red-contrib-dxl').MessageUtils
var EpoClient = require('@opendxl/dxl-epo-client').EpoClient

module.exports = function (RED) {
  /**
   * @classdesc Node which registers an event callback with the DXL client to
   * receive ePO threat events.
   * @param {Object} nodeConfig - Configuration data which the node uses.
   * @param {String} nodeConfig.client - Id of the DXL client configuration node
   *   that this node should be associated with.
   * @param {String} [nodeConfig.topic='/mcafee/event/epo/threat/response'] -
   *   Topic to subscribe to for event notifications.
   * @param {String} [nodeConfig.payloadType=obj] - Controls the data type for
   *   the threat event payload, set as `msg.payload`. If payloadType is 'bin',
   *   `msg.payload` is a raw binary Buffer. If payloadType is 'txt',
   *   `msg.payload` is a String (decoded as UTF-8). If payloadType is 'obj', is
   *   an Object (decoded as a JSON document from the original payload). If an
   *   error occurs when attempting to convert the binary Buffer of the payload
   *   into the desired data type, the current flow is halted with an error.
   * @constructor
   */
  function EpoThreatEventInNode (nodeConfig) {
    RED.nodes.createNode(this, nodeConfig)

    /**
     * Handle to the DXL client node used to make requests to the DXL fabric.
     * @type {Client}
     * @private
     */
    this._client = RED.nodes.getNode(nodeConfig.client)

    /**
     * Controls the data type for the threat event payload.
     * @type {String}
     * @private
     */
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
