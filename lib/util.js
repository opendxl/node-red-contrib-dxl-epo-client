/**
 * @module Util
 * @private
 */

'use strict'

var nodeRedDxl = require('@opendxl/node-red-contrib-dxl')
var NodeUtils = nodeRedDxl.NodeUtils
var epo = require('@opendxl/dxl-epo-client')
var EpoClient = epo.EpoClient
var OutputFormat = epo.OutputFormat

function handleCommandResponse (node, msg, error, result) {
  if (error) {
    node.error('Error running ePO remote command: ' + error.message, msg)
  } else {
    msg.payload = result
    node.send(msg)
  }
}

function runEpoCommand (node, msg, params, epoClient, command, outputFormat) {
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
  runEpoCommand: function (node, msg, command, params, dxlClient, nodeConfig) {
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
      if (epoUniqueId) {
        runEpoCommand(node, msg, params,
          new EpoClient(dxlClient, epoUniqueId), command, outputFormat)
      } else {
        var epoClient = new EpoClient(dxlClient, null,
          function (error) {
            if (error) {
              node.error('Error creating ePO client: ' + error.message)
            } else {
              runEpoCommand(node, msg, params, epoClient, command, outputFormat)
            }
          }
        )
      }
    } else {
      node.error('ePO remote command was not specified', msg)
    }
  }
}
