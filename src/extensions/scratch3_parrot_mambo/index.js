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
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IuODrOOCpOODpOODvF8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiDQoJIHk9IjBweCIgd2lkdGg9IjgwcHgiIGhlaWdodD0iODBweCIgdmlld0JveD0iMCAwIDgwIDgwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA4MCA4MCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8Zz4NCgk8Zz4NCgkJPHBvbHlnb24gZmlsbD0iIzYzNkY3NCIgcG9pbnRzPSIzNi41NzgsMzUuNzY3IDM5LjE3MSwzNS43NjcgMzkuMTcxLDMzLjQ1NyAzNi41NzgsMzMuNDU3IAkJIi8+DQoJCTxwb2x5Z29uIGZpbGw9IiM0QjU2NUIiIHBvaW50cz0iNDEuNzY3LDM1Ljc2NyA0NC4zNTcsMzUuNzY3IDQ0LjM1NywzMy40NTcgNDEuNzY3LDMzLjQ1NyAJCSIvPg0KCQk8Zz4NCgkJCTxyZWN0IHg9IjM1LjIyMiIgeT0iMzQuOTE1IiBmaWxsPSIjNjM2Rjc0IiB3aWR0aD0iNS4zMDUiIGhlaWdodD0iMS43MzQiLz4NCgkJCTxyZWN0IHg9IjQwLjQxIiB5PSIzNC45MTUiIGZpbGw9IiM0QjU2NUIiIHdpZHRoPSI1LjMwNCIgaGVpZ2h0PSIxLjczNCIvPg0KCQk8L2c+DQoJPC9nPg0KCTxwYXRoIGZpbGw9IiNDMEMwQzAiIGQ9Ik02NC4zMTgsMzcuMDY1Yy0wLjc4MywwLTEuNDI1LTAuNzIyLTEuNDI1LTEuNjAzdi02LjQwN2MwLTAuODgxLDAuNjQyLTEuNjAzLDEuNDI1LTEuNjAzDQoJCWMwLjc4NiwwLDEuNDI2LDAuNzIxLDEuNDI2LDEuNjAzdjYuNDA3QzY1Ljc0NywzNi4zNDMsNjUuMTA0LDM3LjA2NSw2NC4zMTgsMzcuMDY1TDY0LjMxOCwzNy4wNjUiLz4NCgk8cGF0aCBmaWxsPSIjQzBDMEMwIiBkPSJNNDkuODc2LDMzLjA2NGMtMC45OTYsMC0xLjgwNi0wLjM4NC0xLjgwMy0wLjg1NmMwLTAuNDcyLDAuODA4LTAuODU1LDEuODAzLTAuODU1aDI4Ljg4NQ0KCQljMC45OTYsMCwxLjgwNiwwLjM4MywxLjgwNiwwLjg1NXMtMC44MSwwLjg1Ni0xLjgwNiwwLjg1Nkg0OS44NzYiLz4NCgk8cG9seWdvbiBmaWxsPSIjNzc3Nzc5IiBwb2ludHM9IjYxLjM2NiwzNS4zNzkgNjcuMjc0LDM1LjM3OSA2Ny4yNzQsNDYuMTU4IDYxLjM2Niw0Ni4xNTggCSIvPg0KCTxwYXRoIGZpbGw9IiM0QjU2NUIiIGQ9Ik02NS40MjEsNDMuNDkzYy0wLjI3MSwwLjI3OS0wLjY4OSwwLjQwMy0xLjEwMywwLjI4NmwtMTMuNi0zLjkzMmMtMC42LTAuMTc0LTAuOTU3LTAuNzk2LTAuNzk5LTEuMzkxDQoJCWMwLjE1OC0wLjU5NSwwLjc3Mi0wLjkzNSwxLjM3LTAuNzYzbDEzLjYwMSwzLjkzMWMwLjYwMSwwLjE3MywwLjk1OCwwLjc5NywwLjgsMS4zOTJDNjUuNjQyLDQzLjIwNCw2NS41NDYsNDMuMzY0LDY1LjQyMSw0My40OTMiDQoJCS8+DQoJPHBhdGggZmlsbD0iIzRCNTY1QiIgZD0iTTY2LjEsNDUuNjQ3Yy0wLjI1OCwwLjM1MS0wLjcxMywwLjU0MS0xLjIwNiwwLjQ1NWwtMTYuMjgtMi44NGMtMC43MTktMC4xMjMtMS4yNDYtMC43ODUtMS4xNzktMS40NzcNCgkJYzAuMDY5LTAuNjkyLDAuNzA4LTEuMTQ5LDEuNDI0LTEuMDI1bDE2LjI4LDIuODM4YzAuNzE5LDAuMTI0LDEuMjQ0LDAuNzg3LDEuMTc4LDEuNDc4QzY2LjI5Niw0NS4yOTQsNjYuMjE4LDQ1LjQ4Nyw2Ni4xLDQ1LjY0NyINCgkJLz4NCgk8Zz4NCgkJPHBhdGggZmlsbD0iIzRCNTY1QiIgZD0iTTYwLjM2Nyw0MS4xMDRjMC0wLjQxMiwwLjMzNC0wLjcwOCwwLjc0NC0wLjY1N2w2LjQxOSwwLjc4OWMwLjQwOSwwLjA1LDAuNzQ1LDAuNDI4LDAuNzQ1LDAuODQxVjUyLjI3DQoJCQljMCwwLjQxMi0wLjI4NywwLjU3Mi0wLjYzOSwwLjM1NGwtNi42MzMtNC4xMDRjLTAuMzUxLTAuMjE4LTAuNjM3LTAuNzMxLTAuNjM3LTEuMTQ1VjQxLjEwNHoiLz4NCgk8L2c+DQoJPHBhdGggZmlsbD0iI0RDRENEQiIgZD0iTTE2LjgxNCwzNy4wNjVMMTYuODE0LDM3LjA2NWMtMC43ODQsMC0xLjQyNS0wLjcyMi0xLjQyNS0xLjYwM3YtNi40MDdjMC0wLjg4MSwwLjY0MS0xLjYwMywxLjQyNS0xLjYwMw0KCQljMC43ODQsMCwxLjQyNiwwLjcyMSwxLjQyNiwxLjYwM3Y2LjQwN0MxOC4yNCwzNi4zNDMsMTcuNTk5LDM3LjA2NSwxNi44MTQsMzcuMDY1Ii8+DQoJPHBhdGggZmlsbD0iI0RDRENEQiIgZD0iTTMxLjI1NywzMy4wNjRIMi4zNzJjLTAuOTk3LDAtMS44MDYtMC4zODQtMS44MDYtMC44NTZzMC44MDktMC44NTUsMS44MDYtMC44NTVoMjguODg1DQoJCWMwLjk5NiwwLDEuODA2LDAuMzgzLDEuODA2LDAuODU1UzMyLjI1MywzMy4wNjQsMzEuMjU3LDMzLjA2NCIvPg0KCTxwb2x5Z29uIGZpbGw9IiM5Nzk3OTciIHBvaW50cz0iMTkuNzY5LDQ2LjE1OCAxMy44NjMsNDYuMTU4IDEzLjg2MywzNS4zNzkgMTkuNzY5LDM1LjM3OSAJIi8+DQoJPHBhdGggZmlsbD0iIzYzNkY3NCIgZD0iTTE1LjcxNCw0My40OTNjLTAuMTI2LTAuMTI5LTAuMjItMC4yOTEtMC4yNjktMC40NzhjLTAuMTU4LTAuNTk1LDAuMi0xLjIxOSwwLjc5OC0xLjM5MmwxMy42MDItMy45MzENCgkJYzAuNTk4LTAuMTczLDEuMjEyLDAuMTY4LDEuMzcxLDAuNzYzYzAuMTU5LDAuNTk1LTAuMTk5LDEuMjE3LTAuOCwxLjM5MWwtMTMuNjAxLDMuOTMyQzE2LjQwNCw0My44OTgsMTUuOTg1LDQzLjc3MiwxNS43MTQsNDMuNDkzDQoJCSIvPg0KCTxwYXRoIGZpbGw9IiM2MzZGNzQiIGQ9Ik0xNS4wMzYsNDUuNjQ3Yy0wLjExOS0wLjE2LTAuMTk2LTAuMzU0LTAuMjE4LTAuNTcxYy0wLjA2OC0wLjY5LDAuNDU5LTEuMzU0LDEuMTc3LTEuNDc4bDE2LjI4MS0yLjgzOA0KCQljMC43MTctMC4xMjQsMS4zNTQsMC4zMzMsMS40MjQsMS4wMjVjMC4wNjcsMC42OTEtMC40NTgsMS4zNTQtMS4xNzcsMS40NzdsLTE2LjI4MSwyLjg0DQoJCUMxNS43NDksNDYuMTg4LDE1LjI5NCw0NS45OTgsMTUuMDM2LDQ1LjY0NyIvPg0KCTxnPg0KCQk8cGF0aCBmaWxsPSIjNjM2Rjc0IiBkPSJNMjAuNzY5LDQ3LjM3NWMwLDAuNDEzLTAuMjg2LDAuOTI3LTAuNjM4LDEuMTQ1bC02LjYzMyw0LjEwNGMtMC4zNSwwLjIxNi0wLjYzOCwwLjA1OC0wLjYzOC0wLjM1NFY0Mi4wNzYNCgkJCWMwLTAuNDEzLDAuMzM1LTAuNzkxLDAuNzQ1LTAuODQxbDYuNDItMC43ODljMC40MS0wLjA1LDAuNzQ0LDAuMjQ1LDAuNzQ0LDAuNjU3VjQ3LjM3NXoiLz4NCgk8L2c+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiNFN0U2RTUiIGQ9Ik00MC40NjgsNDguMDJsLTguNjQ2LTMuMjU4YzAsMC02LjYwNS0xMS4xOTEtMS45ODYtOS4xMjljNC42MTksMi4wNjIsMTAuNjExLDMuMjQxLDEwLjYxMSwzLjI0MQ0KCQkJTDQwLjQ2OCw0OC4wMnoiLz4NCgkJPHBhdGggZmlsbD0iI0QyRDBEMCIgZD0iTTQwLjQyNSw0OC4wMmw4LjY0Ni0zLjI1OGMwLDAsNi42MDQtMTEuMTkxLDEuOTg0LTkuMTI5Yy00LjYxOSwyLjA2Mi0xMC42MTEsMy4yNDEtMTAuNjExLDMuMjQxDQoJCQlMNDAuNDI1LDQ4LjAyeiIvPg0KCQk8cGF0aCBmaWxsPSIjNEI1NjVCIiBkPSJNNDAuNDM5LDQ3Ljk3NWwtNS42NzctMi4xNGMwLDAtNC4zMzgtNy4zNDktMS4zMDQtNS45OTRjMy4wMzMsMS4zNTQsNi45NjksMi4xMjcsNi45NjksMi4xMjcNCgkJCUw0MC40MzksNDcuOTc1eiIvPg0KCQk8cGF0aCBmaWxsPSIjM0E0MjQ3IiBkPSJNNDAuNDEsNDcuOTc1bDUuNjc3LTIuMTRjMCwwLDQuMzM5LTcuMzQ5LDEuMzA2LTUuOTk0Yy0zLjAzMywxLjM1NC02Ljk2OSwyLjEyNy02Ljk2OSwyLjEyN0w0MC40MSw0Ny45NzUNCgkJCXoiLz4NCgk8L2c+DQoJPGc+DQoJCTxjaXJjbGUgZmlsbD0iI0NBREEzQSIgY3g9IjM2LjAzMSIgY3k9IjQyLjc1NiIgcj0iMC45MDgiLz4NCgkJDQoJCQk8cmVjdCB4PSIzNC4yNTEiIHk9IjQzLjA1OCIgdHJhbnNmb3JtPSJtYXRyaXgoLTAuODk1NiAtMC40NDUgMC40NDUgLTAuODk1NiA0OC41MjU3IDk4LjAyMTcpIiBmaWxsPSIjQzZEODM0IiB3aWR0aD0iMy4wMzMiIGhlaWdodD0iMC41MTUiLz4NCgk8L2c+DQoJPGc+DQoJCTxjaXJjbGUgZmlsbD0iI0NBREEzQSIgY3g9IjQ1LjIyMyIgY3k9IjQyLjc1MSIgcj0iMC45MDgiLz4NCgkJDQoJCQk8cmVjdCB4PSI0My45NjgiIHk9IjQzLjA1MyIgdHJhbnNmb3JtPSJtYXRyaXgoMC44OTUzIC0wLjQ0NTUgMC40NDU1IDAuODk1MyAtMTQuNTMyMSAyNC44MDE5KSIgZmlsbD0iI0M2RDgzNCIgd2lkdGg9IjMuMDM2IiBoZWlnaHQ9IjAuNTE0Ii8+DQoJPC9nPg0KPC9nPg0KPGc+DQoJPHJlY3QgeD0iMjkuMzE3IiB5PSI0Ny41NjMiIGZpbGw9IiM3Njc1NzUiIHdpZHRoPSIzLjM4MyIgaGVpZ2h0PSI0LjM2Ii8+DQoJPHJlY3QgeD0iNDguNDM0IiB5PSI0Ny41NjMiIGZpbGw9IiM1OTU3NTciIHdpZHRoPSIzLjM4MyIgaGVpZ2h0PSI0LjM2Ii8+DQo8L2c+DQo8L3N2Zz4NCg==';



class ParrotMamboBlocks {

    /**
     * Construct a set of MicroBit blocks.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor (runtime) {
		this.runtime = runtime;

		stageId = 1;
		changeStage(stageId);
		gameInstance = UnityLoader.instantiate("gameContainer_drone", "static/WebGL/WebGL.json");
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'parrotMamboBlocks',
            name: 'Parrot Drone',
            blockIconURI: blockIconURI,
            colour: "#A0A0A0",
            colourSecondary: "#505050",
            colourTertiary: "#202020",
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
		if(args.m == "標準")
		{
			stageId = 0;
			changeStage(stageId);
		}
		if(args.m == "Simulator")
		{
			stageId = 1;
			changeStage(stageId);
		}

		return;
	}

	reset()
	{
		gameInstance.SendMessage("Drones", "Scratch3", "0,3");
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
		gameInstance.SendMessage("Drones", "Scratch3", "0,4");
		return;
	}

	landing(args)
	{
		gameInstance.SendMessage("Drones", "Scratch3", "0,5");
		return;
	}

	stop(args)
	{
		gameInstance.SendMessage("Drones", "Scratch3", "0,2");
		return;
	}
	
	set_gaz(args)
	{
		var a = 1;
		if(args.m == "下降")
			a = -1;

		var tmp = args.n > 100 ? 100 : args.n
		gameInstance.SendMessage("Drones", "Scratch3", "0,120,0," + a * tmp );

		return;
	}
	
	set_pitch(args)
	{
		var a = 1;
		if(args.m == "後進")
			a = -1;

		var tmp = args.n > 100 ? 100 : args.n
		gameInstance.SendMessage("Drones", "Scratch3", "0,110,0," + a * tmp );

		return;
	}

	set_roll(args)
	{
		var a = 1;
		if(args.m == "左移動")
			a = -1;

		var tmp = args.n > 100 ? 100 : args.n
		gameInstance.SendMessage("Drones", "Scratch3", "0,100,0," + a * tmp );

		return;
	}

	set_yaw(args)
	{
		var a = 1;
		if(args.m == "左旋回")
			a = -1;

		var tmp = args.n > 100 ? 100 : args.n
		gameInstance.SendMessage("Drones", "Scratch3", "0,130,0," + a * tmp );

		return;
	}

	cap(args)
	{
		var a = 1;
		if(args.m == "左旋回")
			a = -1;

		var tmp = args.n > 360 ? 360 : args.n
		gameInstance.SendMessage("Drones", "Scratch3", "0,200,0," + a * tmp );

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
	
		gameInstance.SendMessage("Drones", "Scratch3", "0,210," + a);
		return;
	}	

	light(args)
	{
		gameInstance.SendMessage("Drones", "Scratch3", "0,220,0," + args.n * 255);
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

		gameInstance.SendMessage("Drones", "Scratch3", "0,230," + a);
		return;
	}
	
	picture(args)
	{
		// WebGL側はコマンド未実装
		gameInstance.SendMessage("Drones", "Scratch3", "0,7");
		return;
	}
	
	shoot(args)
	{
		// WebGL側はコマンド未実装
		gameInstance.SendMessage("Drones", "Scratch3", "0,6");
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

		gameInstance.SendMessage("Drones", "Scratch3", "0,140,0," + str );

		return;
	}
}

module.exports = ParrotMamboBlocks;
