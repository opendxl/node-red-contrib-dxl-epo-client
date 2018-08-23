/**
 * @module Util
 * @description General utility methods used by the ePO nodes.
 * @private
 */

'use strict'

var nodeRedDxl = require('@opendxl/node-red-contrib-dxl')
var NodeUtils = nodeRedDxl.NodeUtils
var epo = require('@opendxl/dxl-epo-client')
var EpoClient = epo.EpoClient
var OutputFormat = epo.OutputFormat

/**
 * @classdesc Responsible for all communication with the
 * Data Exchange Layer (DXL) fabric.
 * @external DxlClient
 * @see {@link https://opendxl.github.io/opendxl-client-javascript/jsdoc/Client.html}
 * @private
 */

/**
 * Process the response for an ePO remote command request. For a successful
 * response, the result of the remote command is set on the `msg.payload`
 * property.
 * @param {Object} node - Node-RED node which performed the remote command.
 * @param {Object} msg - Message to send along to outputs from the remote
 *   command node.
 * @param {Error} error - `Error` received, if any, in response to the
 *   remote command request.
 * @param {(Buffer|Object|String)} result - Result from the remote command,
 *   to be set as the `payload` in the output `msg`.
 */
function handleCommandResponse (node, msg, error, result) {
  if (error) {
    node.error('Error running ePO remote command: ' + error.message, msg)
  } else {
    msg.payload = result
    node.send(msg)
  }
}

/**
 * Invokes an ePO remote command on the ePO server this client is communicating
 * with.
 * @param {Object} node - Node-RED node which performed the remote command.
 * @param {Object} msg - Message to send along to outputs from the remote
 *   command node.
 * @param {Object} epoClient - The ePO client through which to run the command.
 * @param {String} command - The name of the remote command to invoke.
 * @param {Object} [params] - An object containing the parameters for the
 *   command.
 * @param {String} [outputFormat=object] - The output format for ePO
 *   to use when returning the response. The list of `output formats` can be
 *   found in the
 *   [OutputFormat]{@link https://opendxl.github.io/opendxl-epo-client-javascript/jsdoc/module-OutputFormat.html}
 *   constants module.
 */
function runEpoCommand (node, msg, epoClient, command, params, outputFormat) {
  params = params || {}
  epoClient.runCommand(
    command,
    function (error, result) {
      handleCommandResponse(node, msg, error, result)
    },
    {
      params: params,
      outputFormat: outputFormat
    }
  )
}

module.exports = {
  /**
   * Invokes an ePO remote command on the ePO server this client is communicating
   * with.
   * @param {Object} node - Node-RED node which performed the remote command.
   * @param {Object} msg - Message to send along to outputs from the remote
   *   command node.
   * @param {String} command - The name of the remote command to invoke. If
   *   a non-empty value is set for the `nodeConfig.command` parameter, the
   *   value in the `nodeConfig.command` property is used instead of the value
   *   in this parameter.
   * @param {external:DxlClient} dxlClient - The DXL client to use for
   *   communication with the ePO DXL service.
   * @param {Object} nodeConfig - Configuration data which the node performing
   *   the remote command uses.
   * @param {String} [nodeConfig.command] - The name of the remote command to
   *   invoke.  If an empty value is set for this parameter, the value in the
   *   `command` parameter is used instead of the value in this parameter.
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
   * @param {Object} [params] - An object containing the parameters for the
   *   command.
   */
  runEpoCommand: function (node, msg, command, dxlClient, nodeConfig, params) {
    command = NodeUtils.defaultIfEmpty(nodeConfig.command, command)
    if (command) {
      var outputFormat = OutputFormat.OBJECT
      if (nodeConfig.returnType) {
        switch (nodeConfig.returnType.toLowerCase()) {
          case 'bin':
            outputFormat = OutputFormat.BINARY
            break
          case 'txt':
            outputFormat = OutputFormat.STRING
            break
        }
      }
      var epoUniqueId = NodeUtils.defaultIfEmpty(nodeConfig.epoUniqueId,
        msg.epoUniqueId)
      var epoClient = new EpoClient(dxlClient, epoUniqueId,
        function (error) {
          if (error) {
            node.error('Error creating ePO client: ' + error.message)
          } else {
            runEpoCommand(node, msg, epoClient, command, params, outputFormat)
          }
        }
      )
    } else {
      node.error('ePO remote command was not specified', msg)
    }
  }
}
