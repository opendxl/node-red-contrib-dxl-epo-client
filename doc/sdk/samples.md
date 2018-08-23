The McAfee ePolicy Orchestrator (ePO) DXL Node-RED client package includes JSON
documents with sample Node-RED flows. To import samples into Node-RED, perform
the following steps:

1. In the upper-right corner of the Node-RED UI, press the side menu button.

1. Select one of examples under
   `Import → Examples → dxl epo-client` in the menu drop-down list.

In order for the sample flows to execute properly, Node-RED must be able to
connect to a DXL fabric. For more information on connecting to a DXL fabric
from Node-RED, see the
[Client Configuration](https://opendxl.github.io/node-red-contrib-dxl/jsdoc/tutorial-configuration.html)
section in the OpenDXL Node-RED package documentation.

See the following sections for an overview of each sample.

### Basic Remote Command (basic-remote-command-example)

This sample invokes and displays the results of a `system.findTag` remote
command via the ePO DXL service.

### Basic System Apply Tag (basic-system-apply-tag-example)

This sample invokes and displays the results of a `system.applyTag` remote
command via the ePO DXL service. 

### Basic System Clear Tag (basic-system-clear-tag-example)

This sample invokes and displays the results of a `system.clearTag` remote
command via the ePO DXL service.

### Basic System Find (basic-system-find-example)

This sample invokes and displays the results of a `system.find` remote command
via the ePO DXL service.

### Basic Threat Event (basic-threat-event-example)

This sample registers with the DXL fabric to receive threat event notifications
from ePO via the ePO DXL service.
