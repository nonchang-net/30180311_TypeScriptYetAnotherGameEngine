import * as GameContext from '../GameContext';
import * as GameEvent from '../GameEvent';
import { default as Utils} from './GameUIUtils';

import * as Rule1 from '../Rules/GameRule1'

export default class CommandDiv{
	dom: HTMLDivElement

	constructor(context: GameContext.GameContext){
		const dom = document.createElement("div")
		this.dom = dom
		dom.style.border = "1px solid gray"
		dom.style.borderRadius = "5px"
		dom.style.marginBottom = "1em"
		dom.style.padding = "0.5em"

		//コマンドh2
		const commandHeader = document.createElement("h2")
		commandHeader.innerText = "コマンド"
		dom.appendChild(commandHeader)

		//攻撃ボタン
		const attackButton = document.createElement("button")
		attackButton.innerText = "たたかう"
		attackButton.onclick = ()=>{
			//UIイベントを発行
			// GameEvent.Manager.broadcast(
			// 	new GameEvent.TestUI.ButtonClick1()
			// )

			//ルール実行、適用差分取得

			//note: UI上で直接ルール評価すべきかどうかは要注意。
			// このサンプルアプリでは簡潔な記述のために直接ルール評価を発行しているけど、大規模なアプリではゲームロジック管理クラスを用意してそこがUIイベントに限らずゲーム進行イベントを一元管理した方が良いだろう。

			// var result =  Rule1.PlayerAttackToEnemy.apply(context)
			var result =  Rule1.StartBattleTurn.apply(context)
			

			//適用差分をコンテキストに適用（その先でイベント実行）
			context.apply(result)
		}

		dom.appendChild(attackButton)
		dom.appendChild(document.createElement("br"))


		const sleepMagic = document.createElement("button")
		sleepMagic.innerText = "スリープの魔法"
		sleepMagic.onclick = ()=>{
			var result =  Rule1.StartBattleTurn.apply(
				context,
				GameContext.ButtleActionKind.SleepMagic
			)
			context.apply(result)
		}

		dom.appendChild(sleepMagic)
		dom.appendChild(document.createElement("br"))


		const cureMagic = document.createElement("button")
		cureMagic.innerText = "回復の魔法"
		cureMagic.onclick = ()=>{
			var result =  Rule1.StartBattleTurn.apply(
				context,
				GameContext.ButtleActionKind.CureMagic
			)
			context.apply(result)
		}

		dom.appendChild(cureMagic)
		dom.appendChild(document.createElement("br"))


		//テストボタン1
		// const testButton1 = document.createElement("button")
		// testButton1.innerText = "スリープの魔法をplayerにかける"
		// testButton1.onclick = ()=>{
		// 	var result =  Rule1.DoSleepMagicToPlayer.apply(context)
		// 	context.apply(result)
		// }
		// dom.appendChild(testButton1)

		// dom.appendChild(document.createElement("br"))

		//テストボタン2
		// const testButton2 = document.createElement("button")
		// testButton2.innerText = "test2"
		// testButton2.onclick = ()=>{
		// 	GameEvent.Manager.broadcast(
		// 		new GameEvent.TestUI.ButtonClick2()
		// 	)
		// }
		// dom.appendChild(testButton2)

		// dom.appendChild(document.createElement("br"))


		// TODO: 一般ステータス変化をsubscribe
		// - コマンドパネルは状況によって表示すべきボタンセットが違う。最初に生成しきっておいて、div単位でグループ化して表示制御するなどの措置が必要だろう。
		// GameEvent.Manager.subscribe<GameEvent.Common.GameStateChanged>(
		// 	new GameEvent.TestRule.PlayerIntoSleeping((event)=>{
		// 		this.update(actorContext)
		// 	})
		// )
	}

	private update(){

	}
}