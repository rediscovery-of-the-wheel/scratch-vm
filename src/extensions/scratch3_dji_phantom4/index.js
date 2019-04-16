const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const log = require('../../util/log');
const cast = require('../../util/cast');
const formatMessage = require('format-message');
const BLE = require('../../io/ble');
const Base64Util = require('../../util/base64-util');

/**
 * Icon png to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IuODrOOCpOODpOODvF8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiDQoJIHk9IjBweCIgd2lkdGg9IjgwcHgiIGhlaWdodD0iODBweCIgdmlld0JveD0iMCAwIDgwIDgwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA4MCA4MCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8Zz4NCgk8Zz4NCgkJPHJlY3QgeD0iMzkuMjEzIiB5PSI0OC4yMSIgZmlsbD0iI0JEQkNDMSIgd2lkdGg9IjMuNjM4IiBoZWlnaHQ9IjYuMjY4Ii8+DQoJCTxyZWN0IHg9IjM1LjYyMSIgeT0iNDguMjEiIGZpbGw9IiNEMEQxRDMiIHdpZHRoPSIzLjY0IiBoZWlnaHQ9IjYuMjY4Ii8+DQoJCTxwYXRoIGZpbGw9IiM4QTkxOTMiIGQ9Ik0zNy4zMTksNTEuMzQ5YzAuMDAxLDEuMDczLDAuODcsMS45NCwxLjk0MSwxLjk0M3YtMy44ODNDMzguMTg5LDQ5LjQxMiwzNy4zMjEsNTAuMjc5LDM3LjMxOSw1MS4zNDkNCgkJCUwzNy4zMTksNTEuMzQ5eiIvPg0KCQk8cGF0aCBmaWxsPSIjRTFFNkRFIiBkPSJNMzcuMzE5LDUxLjM0OWMwLjAwMS0xLjA2OSwwLjg3LTEuOTM3LDEuOTQxLTEuOTM5di0wLjY0N2MtMS40MywwLTIuNTg4LDEuMTU5LTIuNTg4LDIuNTg3DQoJCQljMCwxLjQzMSwxLjE1OSwyLjU5LDIuNTg4LDIuNTl2LTAuNjQ2QzM4LjE4OSw1My4yODksMzcuMzIxLDUyLjQyMiwzNy4zMTksNTEuMzQ5TDM3LjMxOSw1MS4zNDl6Ii8+DQoJCTxwYXRoIGZpbGw9IiNEMEQxRDMiIGQ9Ik0zOS4yNjEsNDguNzYydjAuNjQ3YzEuMDcxLDAsMS45MzksMC44NywxLjkzOSwxLjkzOWMwLDEuMDczLTAuODY5LDEuOTQzLTEuOTM5LDEuOTQzdjAuNjQ2DQoJCQljMS40MjksMCwyLjU4OC0xLjE1OCwyLjU4OC0yLjU5QzQxLjg0OSw0OS45MjMsNDAuNjg5LDQ4Ljc2MiwzOS4yNjEsNDguNzYyTDM5LjI2MSw0OC43NjJ6Ii8+DQoJCTxwYXRoIGZpbGw9IiM1RTZDNjciIGQ9Ik00MS4yLDUxLjM0OWMtMC4wMDEtMS4wNjktMC44Ny0xLjkzNy0xLjkzOS0xLjkzOXYzLjg4M0M0MC4zMzEsNTMuMjg5LDQxLjE5OSw1Mi40MjIsNDEuMiw1MS4zNDkNCgkJCUw0MS4yLDUxLjM0OXoiLz4NCgkJPHJlY3QgeD0iNDIuNDc1IiB5PSI0OC45MzUiIGZpbGw9IiNEMEQxRDMiIHdpZHRoPSIwLjM1IiBoZWlnaHQ9IjQuOTI1Ii8+DQoJCTxyZWN0IHg9IjM1LjYzOCIgeT0iNDguOTM1IiBmaWxsPSIjRTFFNkRFIiB3aWR0aD0iMC4zNDkiIGhlaWdodD0iNC45MjUiLz4NCgkJPHJlY3QgeD0iNDIuODU0IiB5PSI0OC45MzUiIGZpbGw9IiNCREJDQzEiIHdpZHRoPSIwLjQzIiBoZWlnaHQ9IjQuOTI1Ii8+DQoJCTxyZWN0IHg9IjM1LjI3MiIgeT0iNDguOTM1IiBmaWxsPSIjRTFFNkRFIiB3aWR0aD0iMC4zNDkiIGhlaWdodD0iNC45MjUiLz4NCgkJPHJlY3QgeD0iMzMuODYzIiB5PSI0OS4zOTYiIGZpbGw9IiNFMUU2REUiIHdpZHRoPSIxLjQwOSIgaGVpZ2h0PSIzLjg5NCIvPg0KCQk8cmVjdCB4PSI0My4yODMiIHk9IjQ5LjU2MyIgZmlsbD0iIzhEOEE4NiIgd2lkdGg9IjAuMjE1IiBoZWlnaHQ9IjMuNTU5Ii8+DQoJCTxyZWN0IHg9IjQzLjQ5OCIgeT0iNDkuMzk2IiBmaWxsPSIjQkRCQ0MxIiB3aWR0aD0iMS4xOTQiIGhlaWdodD0iMy44OTQiLz4NCgkJPHJlY3QgeD0iMzMuMzE0IiB5PSI0OS4zOTYiIGZpbGw9IiNCREJDQzEiIHdpZHRoPSIwLjUzMiIgaGVpZ2h0PSIzLjg5NCIvPg0KCQk8cmVjdCB4PSIzOS4yNzIiIHk9IjUwLjMzIiBmaWxsPSIjNDY1NzU0IiB3aWR0aD0iMS41NjYiIGhlaWdodD0iMi4xMDMiLz4NCgkJPHJlY3QgeD0iMzcuNzA3IiB5PSI1MC4zNDUiIGZpbGw9IiM3QjdBN0EiIHdpZHRoPSIxLjU2NSIgaGVpZ2h0PSIyLjEwNCIvPg0KCQk8Y2lyY2xlIGZpbGw9IiMwNDAwMDAiIGN4PSIzOS4yNjEiIGN5PSI1MS4zOTYiIHI9IjAuODE4Ii8+DQoJPC9nPg0KCTxwYXRoIGZpbGw9IiNCREJDQzEiIGQ9Ik01MS42MzUsNDEuMTExYzEuNTA5LDIuNjA5LDMuMDUyLDcuNjQ2LDMuMDUyLDE3LjM1NGMwLjAwNiwwLjM3Ni0wLjEyLDAuNzM3LTAuMzQ5LDEuMDENCgkJYy0wLjIzLDAuMjY4LTAuNTQ1LDAuNDIzLTAuODc2LDAuNDI5Yy0wLjY4OC0wLjAxNi0xLjIzNS0wLjY1Ny0xLjIyNi0xLjQzOGMwLTE1LjIxMS0zLjg1My0xNy4yMzYtNC4wMi0xNy4zMTMNCgkJYy0wLjAyNy0wLjAwOC0wLjA1NS0wLjAxOS0wLjA3OS0wLjAzM0w1MS42MzUsNDEuMTExeiIvPg0KCTxwYXRoIGZpbGw9IiNBMUEwQTIiIGQ9Ik01MS45ODQsMzcuNjcxbC00LjI5NywwLjAwOWwwLjAwMiwyLjE5N2MwLjAyMSwxLjEyOSwwLjc0LDIuMDM4LDEuNjI4LDIuMDM4aDIuNjczTDUxLjk4NCwzNy42NzF6Ii8+DQoJPHBhdGggZmlsbD0iI0QwRDFEMyIgZD0iTTMwLjEwNCw0MS4xMmMtMC4wMjYsMC4wMTUtMC4wNTQsMC4wMjUtMC4wODQsMC4wMzNjLTAuMTc0LDAuMDc2LTQuMjMxLDIuMTAyLTQuMjMxLDE3LjMxMw0KCQljMC4wMTEsMC43ODEtMC41NjUsMS40MjMtMS4yOSwxLjQzOGMtMC4zNDgtMC4wMDctMC42OC0wLjE2MS0wLjkyMi0wLjQyOWMtMC4yNDItMC4yNzItMC4zNzUtMC42MzQtMC4zNjktMS4wMQ0KCQljMC05LjcwNywxLjYyNi0xNC43NDUsMy4yMTMtMTcuMzU0TDMwLjEwNCw0MS4xMnoiLz4NCgk8cGF0aCBmaWxsPSIjQkRCQ0MxIiBkPSJNMjYuMDgyLDQxLjkxNGgyLjY3MWMwLjg4OSwwLDEuNjA4LTAuOTA4LDEuNjI5LTIuMDM4bDAuMDAxLTIuMTk3bC00LjI5Ny0wLjAwOUwyNi4wODIsNDEuOTE0eiIvPg0KCTxwYXRoIGZpbGw9IiM3ODc4NzMiIGQ9Ik0xMi4zNTMsMjcuNTZIMS42MjhjLTAuODQ3LDAtMS41MzItMC4yNTQtMS41MzItMC41NjljMC0wLjMxNCwwLjY4Ni0wLjU2OCwxLjUzMi0wLjU2OGgxMC43MjUNCgkJYzAuODQ2LDAsMS41MzIsMC4yNTQsMS41MzIsMC41NjhDMTMuODg1LDI3LjMwNiwxMy4xOTgsMjcuNTYsMTIuMzUzLDI3LjU2TDEyLjM1MywyNy41NnoiLz4NCgk8cGF0aCBmaWxsPSIjRTFFNkRFIiBkPSJNMTUuMDIxLDI0LjcxNmMwLjk0MywwLDEuNzA4LDAuNzY0LDEuNzA4LDEuNzA3djMuOThoLTMuNDEydi0zLjk4DQoJCUMxMy4zMTYsMjUuNDc5LDE0LjA4LDI0LjcxNiwxNS4wMjEsMjQuNzE2TDE1LjAyMSwyNC43MTZ6Ii8+DQoJPHBhdGggZmlsbD0iIzc4Nzg3MyIgZD0iTTI5LjY5OCwyNy41NmgtMTIuNTRjLTAuODY2LDAtMS41NjgtMC4yNTQtMS41NjgtMC41NjljMC0wLjMxNCwwLjcwMy0wLjU2OCwxLjU2OC0wLjU2OGgxMi41NA0KCQljMC44NjYsMCwxLjU2OCwwLjI1NCwxLjU2OCwwLjU2OEMzMS4yNjYsMjcuMzA2LDMwLjU2MywyNy41NiwyOS42OTgsMjcuNTZMMjkuNjk4LDI3LjU2eiIvPg0KCTxwYXRoIGZpbGw9IiM3QjdBN0EiIGQ9Ik0xMy4zMTYsMjkuMjY2aDMuNDEyYzAuMzE0LDAsMC41NjgsMC4yNTQsMC41NjgsMC41Njh2My40MTJoLTQuNTQ5di0zLjQxMg0KCQlDMTIuNzQ3LDI5LjUyLDEzLjAwMSwyOS4yNjYsMTMuMzE2LDI5LjI2NkwxMy4zMTYsMjkuMjY2eiIvPg0KCTxwYXRoIGZpbGw9IiMzMzQ4NUMiIGQ9Ik02MS4xODQsMjcuNzE4SDUwLjQ1OWMtMC44NDUsMC0xLjUzMS0wLjI1NC0xLjUzMS0wLjU2OGMwLTAuMzE1LDAuNjg3LTAuNTY5LDEuNTMxLTAuNTY5aDEwLjcyNQ0KCQljMC44NDYsMCwxLjUzMywwLjI1NCwxLjUzMywwLjU2OUM2Mi43MTcsMjcuNDY0LDYyLjAyOSwyNy43MTgsNjEuMTg0LDI3LjcxOEw2MS4xODQsMjcuNzE4eiIvPg0KCTxwYXRoIGZpbGw9IiNEMEQxRDMiIGQ9Ik02My44NTMsMjQuODc0YzAuOTQxLDAsMS43MDYsMC43NjUsMS43MDYsMS43MDd2My45ODFoLTMuNDEydi0zLjk4MQ0KCQlDNjIuMTQ2LDI1LjYzOSw2Mi45MTEsMjQuODc0LDYzLjg1MywyNC44NzRMNjMuODUzLDI0Ljg3NHoiLz4NCgk8cGF0aCBmaWxsPSIjMzM0ODVDIiBkPSJNNzguNTI5LDI3LjcxOEg2NS45ODhjLTAuODY2LDAtMS41NjUtMC4yNTQtMS41NjUtMC41NjhjMC0wLjMxNSwwLjY5OS0wLjU2OSwxLjU2NS0wLjU2OWgxMi41NDENCgkJYzAuODY2LDAsMS41NjcsMC4yNTQsMS41NjcsMC41NjlDODAuMDk3LDI3LjQ2NCw3OS4zOTYsMjcuNzE4LDc4LjUyOSwyNy43MThMNzguNTI5LDI3LjcxOHoiLz4NCgk8cGF0aCBmaWxsPSIjN0I3QTdBIiBkPSJNNjIuMTQ2LDI5LjQyM2gzLjQxMmMwLjMxNCwwLDAuNTY4LDAuMjU1LDAuNTY4LDAuNTY4djMuNDEyaC00LjU1di0zLjQxMg0KCQlDNjEuNTc4LDI5LjY3OCw2MS44MzMsMjkuNDIzLDYyLjE0NiwyOS40MjNMNjIuMTQ2LDI5LjQyM3oiLz4NCgk8Zz4NCgkJPHBhdGggZmlsbD0iI0QwRDFEMyIgZD0iTTM4LjkyLDM0Ljg2MWgzMC40NTRjLTAuMDA1LTAuNzgzLTAuODQzLTEuNDE3LTEuODgxLTEuNDE3aC03LjI1OGwtMTUuODQzLTMuOTgzDQoJCQljLTAuNTg5LTAuMTQ2LTEuMjAzLTAuMjIyLTEuODIzLTAuMjIySDM4LjkyVjM0Ljg2MXoiLz4NCgk8L2c+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiNFMUU2REUiIGQ9Ik0zOC44ODcsMzQuODYxSDguNDM0YzAuMDA0LTAuNzgzLDAuODQ0LTEuNDE3LDEuODgyLTEuNDE3aDcuMjU2bDE1Ljg0NC0zLjk4Mw0KCQkJYzAuNTg4LTAuMTQ2LDEuMjAzLTAuMjIyLDEuODIzLTAuMjIyaDMuNjQ4VjM0Ljg2MXoiLz4NCgk8L2c+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiNCREJDQzEiIGQ9Ik0zOC45MiwzNC44NjFoMzAuNDU0Yy0wLjAwNSwwLjc4My0wLjg0MywxLjQxNS0xLjg4MSwxLjQxNWgtNy4yNThsLTE1Ljg0MywzLjk4Mw0KCQkJYy0wLjU4OSwwLjE0OC0xLjIwMywwLjIyMy0xLjgyMywwLjIyM0gzOC45MlYzNC44NjF6Ii8+DQoJPC9nPg0KCTxnPg0KCQk8cGF0aCBmaWxsPSIjRDlEOUQ5IiBkPSJNMzguODg3LDM0Ljg2MUg4LjQzNGMwLjAwNCwwLjc4MywwLjg0NCwxLjQxNSwxLjg4MiwxLjQxNWg3LjI1NmwxNS44NDQsMy45ODMNCgkJCWMwLjU4OCwwLjE0OCwxLjIwMywwLjIyMywxLjgyMywwLjIyM2gzLjY0OFYzNC44NjF6Ii8+DQoJPC9nPg0KCTxwYXRoIGZpbGw9IiNDM0MyQ0EiIGQ9Ik00My42MTUsNDEuNzI2aC05LjMydi0wLjQ5OGMwLTAuNjQ0LTAuNTIzLTEuMTY2LTEuMTY2LTEuMTY2aC0wLjQ5OXYtMi4zM2gzLjc0OA0KCQljMC4xOTQtMC40MjgsMC40OTUtMC44MDgsMC44NzEtMS4wOTJjMC40OTUtMC4zNzUsMS4wODQtMC41NzMsMS43MDctMC41NzNjMC42MjIsMCwxLjIxMiwwLjE5NywxLjcwNiwwLjU3Mw0KCQljMC4zNzYsMC4yODUsMC42NzksMC42NjQsMC44NzIsMS4wOTJoMy43NDd2Mi4zM2gtMC41Yy0wLjY0NCwwLTEuMTY0LDAuNTIyLTEuMTY0LDEuMTY2djAuNDk4SDQzLjYxNXoiLz4NCgk8Zz4NCgkJPHBhdGggZmlsbD0iI0ExQTBBMiIgZD0iTTQxLjUzMywzNy43MzJjLTAuMTk0LTAuNDI4LTAuNDk2LTAuODA4LTAuODcyLTEuMDkyYy0wLjQ5NS0wLjM3NS0xLjA4NC0wLjU3My0xLjcwNi0wLjU3M3Y1LjY1OWg0LjY2DQoJCQl2LTAuNWMwLTAuNjQzLDAuNTIxLTEuMTY2LDEuMTY2LTEuMTY2aDAuNDk4di0yLjMzaC0zLjc0NlYzNy43MzJ6Ii8+DQoJPC9nPg0KCTxnPg0KCQk8cmVjdCB4PSIzNi41NDkiIHk9IjQyLjM1NyIgZmlsbD0iI0UxRTZERSIgd2lkdGg9IjUuMDczIiBoZWlnaHQ9IjIuODU3Ii8+DQoJCTxyZWN0IHg9IjM2LjU0OSIgeT0iNDEuNjM5IiBmaWxsPSIjN0I3QTdBIiB3aWR0aD0iNS4wNzMiIGhlaWdodD0iMC42OTQiLz4NCgkJPHJlY3QgeD0iMzcuMDgiIHk9IjQ1LjIxNCIgZmlsbD0iI0JEQkNDMSIgd2lkdGg9IjQuMjY3IiBoZWlnaHQ9IjIuOTkyIi8+DQoJPC9nPg0KCTxyZWN0IHg9IjM5LjE2NiIgeT0iNDIuMzU5IiBmaWxsPSIjQ0VEMENFIiB3aWR0aD0iMi41MzciIGhlaWdodD0iMi44NTYiLz4NCgk8cmVjdCB4PSIzOS4xNjYiIHk9IjQxLjY1NSIgZmlsbD0iIzRBNEM0QyIgd2lkdGg9IjIuNTM3IiBoZWlnaHQ9IjAuNjkzIi8+DQoJPHJlY3QgeD0iMzkuMjI1IiB5PSI0NS4yMDUiIGZpbGw9IiNBNUE1QTciIHdpZHRoPSIyLjEzNCIgaGVpZ2h0PSIyLjk5MyIvPg0KPC9nPg0KPC9zdmc+DQo=';



class DjiPhantom4Blocks {

    /**
     * Construct a set of MicroBit blocks.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor (runtime) {
		this.runtime = runtime;
        id = "0";
//		unityInstance = UnityLoader.instantiate("gameContainer_drone", "static/WebGL/WebGL.json");
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'djiPhantom4Blocks',
            name: 'DJI Drone',
            blockIconURI: blockIconURI,
            colour: "#6dbfff",
            colourSecondary: "#3885c1",
            colourTertiary: "#007fe2",
            blocks: [
                {
                   opcode: 'changeStage',
                   text:'ステージを[m]に切り替える',
                   blockType: BlockType.COMMAND,
                   arguments: {
                       m: {
                           type: ArgumentType.STRING,
                           menu: 'stage',
                           defaultValue: 'Simulator'
                       }
                   }
                },
                {
                   opcode: 'reset',
                   text:'リセット',
                   blockType: BlockType.COMMAND,
                },
                {
                   opcode: 'connected',
                   text: '接続状態',
                   blockType: BlockType.BOOLEAN,
                   arguments: {
                   		CONNECTED: {
                   			type: ArgumentType.BOOLEAN,
                   		}
                   }
                },
                {
                   opcode: 'gaz',
                   text: 'ギャズ（上下速度）',
                   blockType: BlockType.REPORTER,
                },
                {
                   opcode: 'pitch',
                   text: 'ピッチ（前後速度）',
                   blockType: BlockType.REPORTER,
                },
                {
                   opcode: 'roll',
                   text: 'ピッチ（前後速度）',
                   blockType: BlockType.REPORTER,
                },
                {
                   opcode: 'battery',
                   text: 'バッテリー',
                   blockType: BlockType.REPORTER,
                },
                {
                   opcode: 'takeoff',
                   text: '離陸する',
                   blockType: BlockType.COMMAND,
                },
                {
                   opcode: 'landing',
                   text: '着陸する',
                   blockType: BlockType.COMMAND,
                },
                {
                   opcode: 'stop',
                   text: '移動停止（ホバリング）',
                   blockType: BlockType.COMMAND,
                },
                {
                   opcode: 'set_gaz',
                   text: '[m] 速度[n]',
                   blockType: BlockType.COMMAND,
                   arguments: {
                       m: {
                           type: ArgumentType.STRING,
                           menu: 'gaz',
                           defaultValue: '上昇'
                       },
                       n: {
                           type: ArgumentType.NUMBER,
                           defaultValue: 1
                       }
                   }
                },
                {
                   opcode: 'set_pitch',
                   text: '[m] 速度[n]',
                   blockType: BlockType.COMMAND,
                   arguments: {
                       m: {
                           type: ArgumentType.STRING,
                           menu: 'pitch',
                           defaultValue: '前進'
                       },
                       n: {
                           type: ArgumentType.NUMBER,
                           defaultValue: 1
                       }
                   }
                },
               {
                   opcode: 'set_roll',
                   text: '[m] 速度[n]',
                   blockType: BlockType.COMMAND,
                   arguments: {
                       m: {
                           type: ArgumentType.STRING,
                           menu: 'roll',
                           defaultValue: '右移動'
                       },
                       n: {
                           type: ArgumentType.NUMBER,
                           defaultValue: 1
                       }
                   }
                },
               {
                   opcode: 'set_yaw',
                   text: '[m] 速度[n]',
                   blockType: BlockType.COMMAND,
                   arguments: {
                       m: {
                           type: ArgumentType.STRING,
                           menu: 'yaw',
                           defaultValue: '右旋回'
                       },
                       n: {
                           type: ArgumentType.NUMBER,
                           defaultValue: 1
                       }
                   }
                },
               {
                   opcode: 'cap',
                   text: '[m] 角度[n] 度',
                   blockType: BlockType.COMMAND,
                   arguments: {
                       m: {
                           type: ArgumentType.STRING,
                           menu: 'yaw',
                           defaultValue: '右旋回'
                       },
                       n: {
                           type: ArgumentType.NUMBER,
                           defaultValue: 90
                       }
                   }
                },
               {
                   opcode: 'flip',
                   text: '[m] フリップ',
                   blockType: BlockType.COMMAND,
                   arguments: {
                       m: {
                           type: ArgumentType.STRING,
                           menu: 'flip',
                           defaultValue: '前'
                       },
                   }
                },
               {
                   opcode: 'light',
                   text: 'ライト[n]',
                   blockType: BlockType.COMMAND,
                   arguments: {
                       n: {
                           type: ArgumentType.NUMBER,
                           defaultValue: 0
                       }
                   }
                },
               {
                   opcode: 'grab',
                   text: 'アームを[m]',
                   blockType: BlockType.COMMAND,
                   arguments: {
                       m: {
                           type: ArgumentType.STRING,
                           menu: 'grab',
                           defaultValue: '開く←→閉じる'
                       },
                   }
                },
                {
                   opcode: 'picture',
                   text: '写真撮影',
                   blockType: BlockType.COMMAND,
                },
                {
                   opcode: 'shoot',
                   text: '弾を射つ',
                   blockType: BlockType.COMMAND,
                },
               {
                   opcode: 'pitch_roll_yaw_gaz',
                   text: '[m] 速度[n] | [o] 速度[p] | [q] 速度[r] | [s] 速度[t]',
                   blockType: BlockType.COMMAND,
                   arguments: {
                       m: {
                           type: ArgumentType.STRING,
                           menu: 'pitch',
                           defaultValue: '前進'
                       },
                       n: {
                           type: ArgumentType.NUMBER,
                           defaultValue: 0
                       },
                       o: {
                           type: ArgumentType.STRING,
                           menu: 'roll',
                           defaultValue: '右移動'
                       },
                       p: {
                           type: ArgumentType.NUMBER,
                           defaultValue: 0
                       },
                       q: {
                           type: ArgumentType.STRING,
                           menu: 'yaw',
                           defaultValue: '右旋回'
                       },
                       r: {
                           type: ArgumentType.NUMBER,
                           defaultValue: 0
                       },
                       s: {
                           type: ArgumentType.STRING,
                           menu: 'gaz',
                           defaultValue: '上昇'
                       },
                       t: {
                           type: ArgumentType.NUMBER,
                           defaultValue: 0
                       }
                   }
                },
            ],
			menus: {
				stage:["標準", "Simulator"],
				pitch:["前進", "後進"],
				roll:["右移動", "左移動"],
				yaw:["右旋回", "左旋回"],
				gaz:["上昇", "下降"],
				flip:["前", "後", "右", "左"],
				grab:["開く", "閉じる", "開く←→閉じる"]
			}

        };
    }

/* 以下が実行されるメソッド */
	changeStage(args)
	{
		var stageScratch = document.getElementById('scratch_stage');
		var stageDrone = document.getElementById('gameContainer_drone');

		if(args.m == "標準")
		{
			stageScratch.style.display = "block";
			stageDrone.style.display = "none";
			stageScratch.height = "360";
			stageScratch.width = "480";
			droneFlag = false;
		}
		if(args.m == "Simulator")
		{
			stageScratch.style.display = "none";
			stageDrone.style.display = "block";
			droneFlag = true;
		}

		return;
	}

	reset()
	{
//		unityInstance.SendMessage("Drones", "Scratch3", id + ",ACTION_RESET_ALL");
		return;
	}

	connected(args)
	{
		return false;
	}

	gaz(args)
	{
   		return 0;
	}

	pitch(args)
	{
   		return 0;
	}

	roll(args)
	{
		return 0;
	}
	
	battery(args)
	{
		return 0;
	}

	takeoff(args)
	{
//		unityInstance.SendMessage("Drones", "Scratch3", id + ",ACTION_TAKE_OFF");
		return;
	}

	landing(args)
	{
//		unityInstance.SendMessage("Drones", "Scratch3", id + ",ACTION_LANDING");
		return;
	}

	stop(args)
	{
//		unityInstance.SendMessage("Drones", "Scratch3", id + ",ACTION_STOP");
		return;
	}
	
	set_gaz(args)
	{
		var a = 1;
		if(args.m == "下降")
			a = -1;

		var tmp = args.n > 100 ? 100 : args.n
//		unityInstance.SendMessage("Drones", "Scratch3", id + ",ACTION_SET_GAZ,0," + a * tmp );

		return;
	}
	
	set_pitch(args)
	{
		var a = 1;
		if(args.m == "後進")
			a = -1;

		var tmp = args.n > 100 ? 100 : args.n
//		unityInstance.SendMessage("Drones", "Scratch3", id + ",ACTION_SET_PITCH,0," + a * tmp );

		return;
	}

	set_roll(args)
	{
		var a = 1;
		if(args.m == "左移動")
			a = -1;

		var tmp = args.n > 100 ? 100 : args.n
//		unityInstance.SendMessage("Drones", "Scratch3", id + ",ACTION_SET_ROLL,0," + a * tmp );

		return;
	}

	set_yaw(args)
	{
		var a = 1;
		if(args.m == "左旋回")
			a = -1;

		var tmp = args.n > 100 ? 100 : args.n
//		unityInstance.SendMessage("Drones", "Scratch3", id + ",ACTION_SET_YAW,0," + a * tmp );

		return;
	}

	cap(args)
	{
		var a = 1;
		if(args.m == "左旋回")
			a = -1;

		var tmp = args.n > 360 ? 360 : args.n
//		unityInstance.SendMessage("Drones", "Scratch3", id + "0,ACTION_CAP,0," + a * tmp );

		return;
	}
	
	flip(args)
	{
		var a = 0;
		switch(args.m)
		{
			case "前":
				a= 1;
				break;
			case "後":
				a= 2;
				break;
			case "右":
				a= 4;
				break;
			case "左":
				a= 8;
				break;
		}
	
//		unityInstance.SendMessage("Drones", "Scratch3", id + ",ACTION_FLIP," + a);
		return;
	}	

	light(args)
	{
//		unityInstance.SendMessage("Drones", "Scratch3", id + ",ACTION_LIGHT,0," + args.n * 255);
		return;
	}
	
	grab(args)
	{
		var a = 0;
		switch(args.m)
		{
			case "閉じる":
				a= 1;
				break;
			case "開く":
				a= 2;
				break;
			case "開く←→閉じる":
				a= 3;
				break;
		}

//		unityInstance.SendMessage("Drones", "Scratch3", id + ",ACTION_GRAB," + a);
        return;
	}
	
	picture(args)
	{
		// WebGL側はコマンド未実装
//      unityInstance.SendMessage("Drones", "Scratch3", id + ",ACTION_PICTURE");
        return;
	}
	
	shoot(args)
	{
		// WebGL側はコマンド未実装
//		unityInstance.SendMessage("Drones", "Scratch3", id + ",ACTION_SHOOT");
		return;
	}
	
	pitch_roll_yaw_gaz(args)
	{
		var p = 1;
		var r = 1;
		var y = 1;
		var g = 1;

		if(args.m == "後進")
			p = -1;
		if(args.o == "左移動")
			r = -1;
		if(args.q == "左旋回")
			y = -1;
		if(args.s == "下降")
			g = -1;

		var tmp_p = args.n > 100 ? 100 : args.n
		var tmp_r = args.p > 100 ? 100 : args.p
		var tmp_y = args.r > 100 ? 100 : args.r
		var tmp_g = args.t > 100 ? 100 : args.t

		var str = r * tmp_r + ":" + p * tmp_p + ":" + g * tmp_g + ":" + y * tmp_y;

//		unityInstance.SendMessage("Drones", "Scratch3", id + ",ACTION_SET_4_AXIS,0," + str );

		return;
	}
}

module.exports = DjiPhantom4Blocks;
