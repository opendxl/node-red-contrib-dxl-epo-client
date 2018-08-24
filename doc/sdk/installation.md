### Prerequisites

To use the McAfee ePolicy Orchestrator (ePO) DXL Node-RED client package, the
following prerequisites must be satisfied:

* Node-RED must be installed.

  The [OpenDXL Node-RED Docker](https://github.com/opendxl/opendxl-node-red-docker)
  repository provides instructions on how to create a Node-RED container in
  [Docker](https://www.docker.com/).

  For more information on other Node-RED installation approaches, see
  <https://nodered.org/docs/getting-started/installation>.

  > **Note**: In order to be able to import examples properly from the Node-RED
  > UI, version 0.18.0 or newer of Node-RED should be installed.

* [OpenDXL Node-RED](https://github.com/opendxl/node-red-contrib-dxl) core
  package must be installed in Node-RED.

  > **Note**: If you use the
  > [OpenDXL Node-RED Docker](https://github.com/opendxl/opendxl-node-red-docker)
  > image, the OpenDXL Node-RED core package should be installed automatically
  > on the first run of the Docker container.

* McAfee ePolicy Orchestrator (ePO) service is running and available on DXL
  fabric.

  * If version 5.0 or later of the DXL ePO extensions are installed on your ePO
    server, an ePO DXL service should already be running on the fabric.

  * If you are using an earlier version of the DXL ePO extensions, you can use the
    [McAfee ePolicy Orchestrator (ePO) DXL Python Service](https://github.com/opendxl/opendxl-epo-service-python).

* DXL client has been configured in Node-RED.

  * <https://opendxl.github.io/node-red-contrib-dxl/jsdoc/tutorial-configuration.html>

* Node-RED DXL client has permission to invoke ePO remote commands.

  * If version 5.0 or later of DXL ePO extensions are installed on your ePO
    server, follow the steps on the
    [ePO DXL Python Client Authorization](https://opendxl.github.io/opendxl-epo-client-python/pydoc/authorization.html)
    page to ensure that the Node-RED DXL client has appropriate authorization to
    perform ePO remote commands.

  * If you are using the standalone
    [ePO DXL Python Service](https://github.com/opendxl/opendxl-epo-service-python)
    to proxy remote commands to the ePO server, follow the steps on the
    [ePO DXL Python Service Authorization](https://opendxl.github.io/opendxl-epo-service-python/pydoc/authorization.html#client-authorization)
    page to ensure that the Node-RED DXL client has appropriate authorization
    to perform ePO remote commands.

* Node.js 4.0 or higher installed.

### Installation

The ePO DXL Node-RED client package can be installed via the following
approaches:

* Node-RED Based

  With this approach, the ePO DXL Node-RED client package is installed from
  within Node-RED itself. See the
  [Node-RED Based Installation](#node-red-based-installation) section below for
  more information.

* Command Line Installation

  With this approach, the ePO DXL Node-RED client package is installed via
  [npm](https://docs.npmjs.com/) from the command-line on the host where the
  Node-RED server is running. See the
  [Command Line Installation](#command-line-installation) section below for more
  information.

#### Node-RED Based Installation

1. Browse to your Node-RED server.

1. In the upper-right corner, press the side menu button.

1. Choose the `Manage palette` option in the menu drop-down list.

1. From the `Palette` user settings tab, click on the `Install` tab.

1. In the `search modules` text box, enter `dxl-epo`.

1. Next to the entry for `@opendxl/node-red-contrib-dxl-epo-client` in the
   search results, press the `install` button.

1. On the `Installing` confirmation dialog, press the `Install` button.

   A dialog containing text like the following should appear when the
   installation is complete:

   ```
   Nodes added to palette:

   * dxl-epo...
   ```

1. Click on the `Close` button to close the `User Settings` tab.

#### Command Line Installation

Before installing the ePO DXL Node-RED client package, first navigate in a
command shell to the user directory which you have configured for Node-RED. The
`.node-red` directory under the user's `HOME` directory is the default user
directory for Node-RED.

For Mac and Linux-based operating systems, run the following command:

```sh
cd ~/.node-red
```

For Windows, run the following command:

```sh
cd %HOMEPATH%\.node-red
```

To install the library from a local tarball for a Mac or Linux-based operating
system, run the following command:

```sh
npm install ./lib/{@releasetarballname} --save
```

To install the library from a local tarball for Windows, run:

```sh
npm install .\lib\{@releasetarballname} --save
```

To install the library via the
[npm package registry](https://www.npmjs.com/package/@opendxl/node-red-contrib-dxl-epo-client),
run the following command:

```sh
npm install @opendxl/node-red-contrib-dxl-epo-client --save
```

After the installation is complete, restart Node-RED and browse to your
Node-RED server.

#### Confirming the Installation Result

After the installation is complete, you should see several `epo operations` and
`epo notifications` nodes in the left column:

![ePolicy Orchestrator (ePO) Operations Nodes](images/epo-operations-nodes.png)

![ePolicy Orchestrator (ePO) Notifications Nodes](images/epo-notifications-nodes.png)

For more information, see the
[Node-RED Configuration](https://nodered.org/docs/configuration) documentation.
