/**
 * @module Util
 * @private
 */

'use strict'

var MessageUtils = require('@opendxl/node-red-contrib-dxl').MessageUtils
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

function runEpoCommand (node, msg, epoClient, returnType, outputFormat) {
  var params = msg.payload || {}
  epoClient.runCommand(
    msg.command,
    function (commandError, result) {
      handleCommandResponse(node, msg, commandError, result, returnType)
    },
    params,
    outputFormat
  )
}

module.exports = {
  runEpoCommand: function (node, msg, dxlClient, returnType, outputFormat) {
    if (msg.command) {
      returnType = returnType || 'obj'
      if (outputFormat) {
        outputFormat = outputFormat.toLowerCase()
        OutputFormat.validate(outputFormat)
      } else {
        outputFormat = OutputFormat.JSON
      }
      if (msg.epoUniqueId) {
        runEpoCommand(node, msg, new EpoClient(dxlClient, msg.epoUniqueId),
          returnType, outputFormat)
      } else {
        var epoClient = new EpoClient(dxlClient, null,
          function (error) {
            if (error) {
              node.error('Error creating ePO client: ' + error.message)
            } else {
              runEpoCommand(node, msg, epoClient, returnType, outputFormat)
            }
          }
        )
      }
    } else {
      node.error('ePO remote command was not specified', msg)
    }
  }
}
