/**
 * @module Util
 * @private
 */

'use strict'

var nodeRedDxl = require('@opendxl/node-red-contrib-dxl')
var MessageUtils = nodeRedDxl.MessageUtils
var NodeUtils = nodeRedDxl.NodeUtils
var epo = require('@opendxl/dxl-epo-client')
var EpoClient = epo.EpoClient
var OutputFormat = epo.OutputFormat

function handleCommandResponse (node, msg, commandError, result, returnType) {
  var error = null
  if (result) {
    try {
      msg.payload = MessageUtils.decode(result, returnType)
    } catch (payloadError) {
      error = payloadError
    }
  } else {
    error = commandError
  }
  if (error) {
    node.error('Error running ePO remote command: ' + error.message, msg)
  } else {
    node.send(msg)
  }
}

function runEpoCommand (node, msg, params, epoClient, command,
                        returnType, outputFormat) {
  params = params || {}
  epoClient.runCommand(
    command,
    function (commandError, result) {
      handleCommandResponse(node, msg, commandError, result, returnType)
    },
    params,
    outputFormat
  )
}

module.exports = {
  runEpoCommand: function (node, msg, command, params, dxlClient, nodeConfig) {
    command = NodeUtils.defaultIfEmpty(nodeConfig.command, command)
    if (command) {
      var returnType = nodeConfig.returnType || 'obj'
      var outputFormat = OutputFormat.JSON
      if (nodeConfig.outputFormat) {
        outputFormat = nodeConfig.outputFormat.toLowerCase()
        OutputFormat.validate(outputFormat)
      }
      var epoUniqueId = NodeUtils.defaultIfEmpty(nodeConfig.epoUniqueId,
        msg.epoUniqueId)
      if (epoUniqueId) {
        runEpoCommand(node, msg, new EpoClient(dxlClient, epoUniqueId),
          command, returnType, outputFormat)
      } else {
        var epoClient = new EpoClient(dxlClient, null,
          function (error) {
            if (error) {
              node.error('Error creating ePO client: ' + error.message)
            } else {
              runEpoCommand(node, msg, params, epoClient, command,
                returnType, outputFormat)
            }
          }
        )
      }
    } else {
      node.error('ePO remote command was not specified', msg)
    }
  }
}
