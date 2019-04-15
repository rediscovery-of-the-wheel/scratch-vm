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
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IuODrOOCpOODpOODvF8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiDQoJIHk9IjBweCIgd2lkdGg9IjgwcHgiIGhlaWdodD0iODBweCIgdmlld0JveD0iMCAwIDgwIDgwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA4MCA4MCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8cGF0aCBmaWxsPSIjNzE3MDcxIiBkPSJNMTIuNzIxLDQ1LjI0MmMtMC4xMDktMC4xNDctMC4xOC0wLjMyNS0wLjItMC41MjRjLTAuMDYxLTAuNjM1LDAuNDIyLTEuMjQzLDEuMDgyLTEuMzU4bDE0Ljk1OS0yLjYwNw0KCWMwLjY1OC0wLjExNCwxLjI0NSwwLjMwNiwxLjMwOCwwLjk0MmMwLjA2MywwLjYzNi0wLjQyMSwxLjI0NC0xLjA4MSwxLjM1OEwxMy44MjksNDUuNjZDMTMuMzc2LDQ1LjczOCwxMi45NTksNDUuNTY0LDEyLjcyMSw0NS4yNDINCgkiLz4NCjxwYXRoIGZpbGw9IiM1OTU3NTciIGQ9Ik0xMy4xMjYsNTUuMDJ2LTguMjA5SDkuODAzbDAuNjgsNy4xNDdjMC4wNTgsMC42MDMsMC41NjQsMS4wNjMsMS4xNjksMS4wNjJIMTMuMTI2eiBNMTEuNjUyLDU1LjAyIi8+DQo8cGF0aCBmaWxsPSIjNTk1NzU3IiBkPSJNMTMuMDgzLDU1LjAyYzAsMCwxLjMwNywwLDEuMzA4LDBjMC41NzIsMC4wMDEsMS4wNi0wLjQxMywxLjE1My0wLjk3N2MwLjAwNS0wLjAxOSwwLjAwOC0wLjAzNiwwLjAxLTAuMDU2DQoJbDAuMDE4LTAuMTRsMC4wMjMtMC4xOTRsMC4wOTYtMC43ODNsMC4wMjMtMC4xOTVsMC4wMjMtMC4xOTRsMC4wOTYtMC43ODNsMC4wMjMtMC4xOTVsMC4wMjMtMC4xOTNsMC4wOTYtMC43ODVMMTYsNTAuMzI5DQoJbDAuMDIzLTAuMTkzbDAuMDk2LTAuNzg0bDAuMDIzLTAuMTk2bDAuMDI0LTAuMTkzbDAuMDIzLTAuMTk0bDAuOTk5LTEuOTU3aC00LjEwNFY1NS4wMkwxMy4wODMsNTUuMDJ6IE0xMy4wODMsNTUuMDIiLz4NCjxnPg0KCTxnPg0KCQk8cGF0aCBmaWxsPSIjNkE2QTcwIiBkPSJNMTQuMTgxLDMzLjQzOEwxNC4xODEsMzMuNDM4Yy0wLjU4NiwwLTEuMDY2LTAuNTM5LTEuMDY2LTEuMTk4di00Ljc5YzAtMC42NTksMC40OC0xLjE5NywxLjA2Ni0xLjE5Nw0KCQkJczEuMDY1LDAuNTM4LDEuMDY1LDEuMTk3djQuNzlDMTUuMjQ2LDMyLjg5OSwxNC43NjcsMzMuNDM4LDE0LjE4MSwzMy40MzgiLz4NCgkJPHBhdGggZmlsbD0iIzZBNkE3MCIgZD0iTTI1LjgwNywzMC40NDdIMi41NTVjLTAuODAyLDAtMS40NTQtMC4zMDktMS40NTQtMC42ODhzMC42NTItMC42ODksMS40NTQtMC42ODloMjMuMjUyDQoJCQljMC44MDIsMCwxLjQ1MiwwLjMwOSwxLjQ1MiwwLjY4OUMyNy4yNiwzMC4xMzgsMjYuNjA5LDMwLjQ0NywyNS44MDcsMzAuNDQ3Ii8+DQoJPC9nPg0KCTxwb2x5Z29uIGZpbGw9IiNDOEM5Q0EiIHBvaW50cz0iMTYuMjIsNDAuMjY1IDExLjgwNSw0MC4yNjUgMTEuODA1LDMyLjIwOSAxNi4yMiwzMi4yMDkgCSIvPg0KCTxwYXRoIGZpbGw9IiM3MTcwNzEiIGQ9Ik0xMy40MzYsNDMuMzU3Yy0wLjEyOS0wLjEzNS0wLjIyNy0wLjMwMy0wLjI3Ni0wLjQ5OGMtMC4xNTktMC42MjMsMC4yMjYtMS4yODIsMC44NTktMS40NzNsMTQuMzYtNC4zMTMNCgkJYzAuNjMxLTAuMTg5LDEuMjc0LDAuMTYyLDEuNDMzLDAuNzg0YzAuMTU4LDAuNjI0LTAuMjI2LDEuMjgzLTAuODYsMS40NzNsLTE0LjM1OSw0LjMxMw0KCQlDMTQuMTU3LDQzLjc3NCwxMy43MTksNDMuNjQ5LDEzLjQzNiw0My4zNTciLz4NCgk8cG9seWxpbmUgZmlsbD0iIzcxNzA3MSIgcG9pbnRzPSIxNy4wNTYsNDQuOTg1IDE3LjA1Niw0MC41NjEgMTAuNzUzLDQwLjU2MSAxMC43NTMsNDQuOTg1IAkiLz4NCgk8cG9seWxpbmUgZmlsbD0iIzcxNzA3MSIgcG9pbnRzPSIxNy4wNTYsNDAuNiAxNy4wNTYsMzguNyA5Ljg1OSwzOC43IDkuODU5LDQwLjYgCSIvPg0KPC9nPg0KPHBvbHlsaW5lIGZpbGw9IiM3MTcwNzEiIHBvaW50cz0iMTcuMDU2LDQ2Ljg0OSAxNy4wNTYsNDQuOTQ4IDkuODU5LDQ0Ljk0OCA5Ljg1OSw0Ni44NDkgIi8+DQo8Zz4NCgk8cGF0aCBmaWxsPSIjM0UzQTM5IiBkPSJNNjYuMDIsMzMuNDM4TDY2LjAyLDMzLjQzOGMwLjU4NywwLDEuMDY2LTAuNTM5LDEuMDY2LTEuMTk4di00Ljc5YzAtMC42NTktMC40NzktMS4xOTctMS4wNjYtMS4xOTcNCgkJYy0wLjU4NSwwLTEuMDY0LDAuNTM5LTEuMDY0LDEuMTk3djQuNzlDNjQuOTU1LDMyLjg5OSw2NS40MzUsMzMuNDM4LDY2LjAyLDMzLjQzOCIvPg0KCTxwYXRoIGZpbGw9IiMzRTNBMzkiIGQ9Ik01NC4zOTUsMzAuNDQ3aDIzLjI1MmMwLjgwMiwwLDEuNDUzLTAuMzA4LDEuNDUzLTAuNjg4YzAtMC4zOC0wLjY1MS0wLjY4OS0xLjQ1My0wLjY4OUg1NC4zOTUNCgkJYy0wLjgwMiwwLTEuNDUzLDAuMzA5LTEuNDUzLDAuNjg5QzUyLjk0MSwzMC4xMzksNTMuNTkyLDMwLjQ0Nyw1NC4zOTUsMzAuNDQ3Ii8+DQo8L2c+DQo8cG9seWdvbiBmaWxsPSIjQjRCNEI1IiBwb2ludHM9IjYzLjgzMiw0MC4yNjUgNjguMjQ3LDQwLjI2NSA2OC4yNDcsMzIuMjEgNjMuODMyLDMyLjIxICIvPg0KPHBhdGggZmlsbD0iIzRCNTY1QiIgZD0iTTY2LjYxNiw0My4zNTdjMC4xMy0wLjEzNSwwLjIyOC0wLjMwMywwLjI3Ny0wLjQ5N2MwLjE1Ny0wLjYyNC0wLjIyNy0xLjI4My0wLjg2LTEuNDc0bC0xNC4zNi00LjMxMw0KCWMtMC42MzEtMC4xODktMS4yNzIsMC4xNjEtMS40MzMsMC43ODRjLTAuMTU4LDAuNjI1LDAuMjI3LDEuMjg0LDAuODU5LDEuNDczbDE0LjM1OSw0LjMxMw0KCUM2NS44OTYsNDMuNzc0LDY2LjMzMyw0My42NDksNjYuNjE2LDQzLjM1NyIvPg0KPHBhdGggZmlsbD0iIzRCNTY1QiIgZD0iTTY3LjMzMSw0NS4yNDJjMC4xMDktMC4xNDcsMC4xOC0wLjMyNSwwLjItMC41MjRjMC4wNjEtMC42MzUtMC40MjItMS4yNDMtMS4wODEtMS4zNThsLTE0Ljk1OS0yLjYwNw0KCWMtMC42NTgtMC4xMTQtMS4yNDQsMC4zMDYtMS4zMDksMC45NDJjLTAuMDYyLDAuNjM2LDAuNDIxLDEuMjQ0LDEuMDgyLDEuMzU4bDE0Ljk1OSwyLjYwNw0KCUM2Ni42NzYsNDUuNzM4LDY3LjA5NCw0NS41NjQsNjcuMzMxLDQ1LjI0MiIvPg0KPHBhdGggZmlsbD0iIzNFM0EzOSIgZD0iTTY4LjQsNTUuMDJjMC42MDUsMC4wMDEsMS4xMTEtMC40NTksMS4xNjktMS4wNjFsMC42OC03LjE0OGgtMy4zMjJ2OC4yMDlINjguNHogTTY4LjQsNTUuMDIiLz4NCjxwYXRoIGZpbGw9IiMzRTNBMzkiIGQ9Ik02Ni45Nyw1NS4wMnYtOC4yMDloLTQuMTA1bDAuOTk5LDEuOTU3bDAuMDIzLDAuMTk0bDAuMDIzLDAuMTk0bDAuMDIzLDAuMTk1bDAuMDk2LDAuNzg0bDAuMDIzLDAuMTkzDQoJbDAuMDIzLDAuMTk1bDAuMDk2LDAuNzg0bDAuMDIzLDAuMTkzbDAuMDIzLDAuMTk2bDAuMDk2LDAuNzgzbDAuMDI0LDAuMTkzbDAuMDIyLDAuMTk1bDAuMDk2LDAuNzgzbDAuMDIzLDAuMTk0bDAuMDE4LDAuMTQxDQoJYzAuMDAyLDAuMDE5LDAuMDA1LDAuMDM2LDAuMDEsMC4wNTVjMC4wOTMsMC41NjQsMC41ODIsMC45NzksMS4xNTQsMC45NzdINjYuOTdMNjYuOTcsNTUuMDJ6IE02Ni45Nyw1NS4wMiIvPg0KPGc+DQoJPHBvbHlsaW5lIGZpbGw9IiM0QjU2NUIiIHBvaW50cz0iNjIuOTk2LDQ1LjAxIDYyLjk5Niw0MC41ODUgNjkuMjk5LDQwLjU4NSA2OS4yOTksNDUuMDEgCSIvPg0KCTxwb2x5bGluZSBmaWxsPSIjNEI1NjVCIiBwb2ludHM9IjYyLjk5Nyw0MC42IDYyLjk5NywzOC43IDcwLjE5MywzOC43IDcwLjE5Myw0MC42IAkiLz4NCgk8cG9seWxpbmUgZmlsbD0iIzRCNTY1QiIgcG9pbnRzPSI2Mi45OTYsNDYuODczIDYyLjk5Niw0NC45NzMgNzAuMTkzLDQ0Ljk3MyA3MC4xOTMsNDYuODczIAkiLz4NCjwvZz4NCjxnPg0KCTxwYXRoIGZpbGw9IiNFN0U2RTUiIGQ9Ik01My4zNDIsMzkuMzc3YzAuMDA3LTAuMDcxLDAuMDE3LTAuMTQzLDAuMDE3LTAuMjE2di0xLjYxNWMwLTEuNzg1LTIuMjQtMy4yMzItNS4wMDUtMy4yMzJIMzEuNzkNCgkJYy0yLjc2NCwwLTUuMDA0LDEuNDQ3LTUuMDA0LDMuMjMydjEuNjE1YzAsMC4wNzMsMC4wMDksMC4xNDUsMC4wMTcsMC4yMTYiLz4NCgk8cGF0aCBmaWxsPSIjRDJEMEQwIiBkPSJNNDguMjc3LDM0LjMxNGgtOC4yMDV2NS4wNjNINTMuMjJjMC4wMDctMC4wNzEsMC4wMTctMC4xNDMsMC4wMTctMC4yMTZ2LTEuNjE1DQoJCUM1My4yMzYsMzUuNzYxLDUxLjAxNiwzNC4zMTQsNDguMjc3LDM0LjMxNHoiLz4NCgk8cGF0aCBmaWxsPSIjMjMxODE1IiBkPSJNMjYuNzg1LDM5LjMyOWMtMC4wMDcsMC4xMjItMC4wMTcsMC4yNDItMC4wMTcsMC4zNjZ2Mi43NGMwLDMuMDI2LDIuMjQxLDUuNDgsNS4wMDQsNS40OGgxNi41NjUNCgkJYzIuNzY0LDAsNS4wMDQtMi40NTQsNS4wMDQtNS40OHYtMi43NGMwLTAuMTI0LTAuMDA5LTAuMjQ0LTAuMDE3LTAuMzY2Ii8+DQoJPGc+DQoJCTxsaW5lIGZpbGw9IiMyMzE4MTUiIHgxPSIzMS44MDIiIHkxPSIzOS4zOTYiIHgyPSIyNi43ODUiIHkyPSIzOS4zOTYiLz4NCgkJPGxpbmUgZmlsbD0iIzIzMTgxNSIgeDE9IjQ4LjMwOSIgeTE9IjM5LjM5NiIgeDI9IjUzLjMyNSIgeTI9IjM5LjM5NiIvPg0KCQk8cGF0aCBmaWxsPSIjMjMxODE1IiBkPSJNMzEuODAyLDM5LjM5NmMwLjM2Mi0xLjQ2OCwxLjU4My0yLjU1LDMuMDM5LTIuNTVINDUuMjdjMS40NTYsMCwyLjY3OCwxLjA4MiwzLjAzOSwyLjU1Ii8+DQoJPC9nPg0KCTxwYXRoIGZpbGw9IiM2MzZGNzQiIGQ9Ik00MC4wNTYsMzkuMzc5aC04LjI1NGgtNS4wMTdjLTAuMDA3LDAuMTIyLTAuMDE3LDAuMjQyLTAuMDE3LDAuMzY2djIuNzM5YzAsMy4wMjcsMi4yNDEsNS40ODEsNS4wMDQsNS40ODENCgkJaDguMjg0VjM5LjM3OXoiLz4NCgk8cGF0aCBmaWxsPSIjNjM2Rjc0IiBkPSJNNDAuMDU2LDM2LjgyOWgtNS4yMTVjLTEuNDU2LDAtMi42NzcsMS4wODItMy4wMzksMi41NWg4LjI1NFYzNi44Mjl6Ii8+DQo8L2c+DQo8Zz4NCgk8Zz4NCgkJPHBhdGggZmlsbD0iIzNBNDI0NyIgZD0iTTM5Ljk2NCwzOC42Mjl2Ni41MzFjMS44MDIsMCwzLjI2NS0xLjQ2MSwzLjI2NS0zLjI2NEM0My4yMjksNDAuMDkxLDQxLjc2NiwzOC42MjksMzkuOTY0LDM4LjYyOXoiLz4NCgkJPHBhdGggZmlsbD0iIzRCNTY1QiIgZD0iTTM5Ljk5NywzOC42MjljLTEuODAzLDAtMy4yNjYsMS40NjItMy4yNjYsMy4yNjdjMCwxLjgwMywxLjQ2MiwzLjI2NCwzLjI2NiwzLjI2NFYzOC42Mjl6Ii8+DQoJPC9nPg0KCTxnPg0KCQk8cGF0aCBmaWxsPSIjNDg0NTQ1IiBkPSJNMzkuOTk3LDM5LjY4M2MtMS4yMjEsMC0yLjIxMiwwLjk5LTIuMjEyLDIuMjEyYzAsMS4yMjIsMC45OTEsMi4yMTIsMi4yMTIsMi4yMTJWMzkuNjgzeiIvPg0KCQk8cGF0aCBmaWxsPSIjMjMxODE1IiBkPSJNMzkuOTk3LDM5LjY4M3Y0LjQyNGMxLjIyMSwwLDIuMjExLTAuOTksMi4yMTEtMi4yMTJDNDIuMjA4LDQwLjY3Myw0MS4yMTgsMzkuNjgzLDM5Ljk5NywzOS42ODN6Ii8+DQoJPC9nPg0KPC9nPg0KPC9zdmc+DQo=';



class DjiTelloBlocks {

    /**
     * Construct a set of MicroBit blocks.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor (runtime) {
		this.runtime = runtime;
		stageId = 2;
		changeStage(stageId);
		djiTelloInstance = UnityLoader.instantiate("djiTello_drone", "static/dji_tello/dji_tello.json");
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'djiTelloBlocks',
            name: 'DJI Tello',
            blockIconURI: blockIconURI,
            colour: "#42f4ad",
            colourSecondary: "#008e47",
            colourTertiary: "#2eaa6c",
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
                    opcode: 'searchColor',
                    blockType: BlockType.COMMAND,
                    text: '[COLOR]色を探す',
                    arguments: {
                        COLOR: {
                            type: ArgumentType.COLOR
                        }
                    }
                },
                {
                   opcode: 'picture',
                   text: '写真撮影',
                   blockType: BlockType.COMMAND,
                },
               {
                   opcode: 'face',
                   text: '顔を[m]',
                   blockType: BlockType.COMMAND,
                   arguments: {
                       m: {
                           type: ArgumentType.STRING,
                           menu: 'face',
                           defaultValue: '登録する'
                       },
                   }
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
                {
                   opcode: 'move',
                   text: '[m]に移動する',
                   blockType: BlockType.COMMAND,
                   arguments: {
                       m: {
                           type: ArgumentType.STRING,
                           menu: 'move',
                           defaultValue: '中心'
                       },
                   }
                }
            ],
			menus: {
				stage:["標準", "Simulator"],
				pitch:["前進", "後進"],
				roll:["右移動", "左移動"],
				yaw:["右旋回", "左旋回"],
				gaz:["上昇", "下降"],
				flip:["前", "後", "右", "左"],
				face:["登録する", "探す"],
				move:["中心"]
			}

        };
    }

/* 以下が実行されるメソッド */
	changeStage(args)
	{
		if(args.m == "標準")
		{
			stageId = 0;
			changeStage(stageId);
		}
		if(args.m == "Simulator")
		{
			stageId = 2;
			changeStage(stageId);
		}

		return;
	}

	reset()
	{
		djiTelloInstance.SendMessage("Drones", "Scratch3", "0,3");
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
		djiTelloInstance.SendMessage("Drones", "Scratch3", "0,4");
		return;
	}

	landing(args)
	{
		djiTelloInstance.SendMessage("Drones", "Scratch3", "0,5");
		return;
	}

	stop(args)
	{
		djiTelloInstance.SendMessage("Drones", "Scratch3", "0,2");
		return;
	}
	
	set_gaz(args)
	{
		var a = 1;
		if(args.m == "下降")
			a = -1;

		var tmp = args.n > 100 ? 100 : args.n;
		djiTelloInstance.SendMessage("Drones", "Scratch3", "0,120,0," + a * tmp );

		return;
	}
	
	set_pitch(args)
	{
		var a = 1;
		if(args.m == "後進")
			a = -1;

		var tmp = args.n > 100 ? 100 : args.n;
		djiTelloInstance.SendMessage("Drones", "Scratch3", "0,110,0," + a * tmp );

		return;
	}

	set_roll(args)
	{
		var a = 1;
		if(args.m == "左移動")
			a = -1;

		var tmp = args.n > 100 ? 100 : args.n;
		djiTelloInstance.SendMessage("Drones", "Scratch3", "0,100,0," + a * tmp );

		return;
	}

	set_yaw(args)
	{
		var a = 1;
		if(args.m == "左旋回")
			a = -1;

		var tmp = args.n > 100 ? 100 : args.n;
		djiTelloInstance.SendMessage("Drones", "Scratch3", "0,130,0," + a * tmp );

		return;
	}

	cap(args)
	{
		var a = 1;
		if(args.m == "左旋回")
			a = -1;

		var tmp = args.n > 360 ? 360 : args.n;
		djiTelloInstance.SendMessage("Drones", "Scratch3", "0,200,0," + a * tmp );

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
	
		djiTelloInstance.SendMessage("Drones", "Scratch3", "0,210," + a);
		return;
	}	

	light(args)
	{
		djiTelloInstance.SendMessage("Drones", "Scratch3", "0,220,0," + args.n * 255);
		return;
	}
	
	face(args)
	{
		// WebGL側はコマンド未実装
		return;
	}
	
	picture(args)
	{
		// WebGL側はコマンド未実装
//		djiTelloInstance.SendMessage("Drones", "Scratch3", "0,7");
		return;
	}
	
	searchColor(args)
	{
		// WebGL側はコマンド未実装
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

		djiTelloInstance.SendMessage("Drones", "Scratch3", "0,140,0," + str );

		return;
	}
	
	move(args)
	{
		return;
	}
}

module.exports = DjiTelloBlocks;
