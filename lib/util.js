/**
 * @module Util
 * @private
 */

'use strict'

var MessageUtils = require('@opendxl/dxl-bootstrap').MessageUtils
var epo = require('@opendxl/dxl-epo-client')
var EpoClient = epo.EpoClient
var OutputFormat = epo.OutputFormat

function handleCommandResponse (node, msg, commandError, result) {
  var error = null
  if (result) {
    try {
      if (msg.outputFormat === OutputFormat.JSON) {
        msg.payload = MessageUtils.jsonToObject(result)
      } else {
        msg.payload = result
      }
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

function runEpoCommand (node, msg, epoClient) {
  var params = msg.payload || {}
  epoClient.runCommand(
    msg.command,
    function (commandError, result) {
      handleCommandResponse(node, msg, commandError, result)
    },
    params,
    msg.outputFormat
  )
}

module.exports = {
  runEpoCommand: function (node, msg, dxlClient) {
    if (msg.command) {
      if (msg.outputFormat) {
        msg.outputFormat = msg.outputFormat.toLowerCase()
        OutputFormat.validate(msg.outputFormat)
      } else {
        msg.outputFormat = OutputFormat.JSON
      }
      if (msg.epoUniqueId) {
        runEpoCommand(node, msg, new EpoClient(dxlClient, msg.epoUniqueId))
      } else {
        var epoClient = new EpoClient(dxlClient, null,
          function (error) {
            if (error) {
              node.error('Error creating ePO client: ' + error.message)
            } else {
              runEpoCommand(node, msg, epoClient)
            }
          }
        )
      }
    } else {
      node.error('ePO remote command was not specified', msg)
    }
  }
}
