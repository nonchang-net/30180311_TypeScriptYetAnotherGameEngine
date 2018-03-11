/*


## 検討メモ

- このSampleGameでは、UIコード上で直接ルール評価している。

- この実装では実ゲーム製作時にはスケールしないと思う。
	- このサンプルアプリでは簡潔な記述のために直接ルール評価を発行しているけど、「UIイベントの発行」に留めたほうが良いと思う。
	- 大規模なアプリではゲームロジック管理クラスを用意するべき。
		- そこで、UIイベントに限らずゲーム進行イベントを一元管理した方が良いだろう。


*/
import * as GameContext from '../GameContext';
import * as GameEvent from '../GameEvent';
import { default as Utils} from './GameUIUtils';

import * as Rule1 from '../Rules/GameRule1'

export default class CommandDiv{
	dom: HTMLDivElement
	context: GameContext.GameContext

	titleCommandSet: HTMLDivElement
	battleCommandSet: HTMLDivElement
	gameoverCommandSet: HTMLDivElement

	constructor(context: GameContext.GameContext){

		this.context = context

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


		// ===============
		// タイトルコマンド

		const titleCommandSet = document.createElement("div")
		this.titleCommandSet = titleCommandSet
		dom.appendChild(titleCommandSet)

		const intoDangeon = document.createElement("button")
		intoDangeon.innerText = "洞窟に入る"
		intoDangeon.onclick = ()=>{
			context.setState(GameContext.GameState.Battle)
		}
		titleCommandSet.appendChild(intoDangeon)
		titleCommandSet.appendChild(document.createElement("br"))


		// ===============
		// ゲームオーバー

		const gameoverCommandSet = document.createElement("div")
		this.gameoverCommandSet = gameoverCommandSet
		dom.appendChild(gameoverCommandSet)

		const backToTitle = document.createElement("button")
		backToTitle.innerText = "タイトルに戻る"
		backToTitle.onclick = ()=>{
			context.init()
			context.setState(GameContext.GameState.Title)
		}
		gameoverCommandSet.appendChild(backToTitle)
		gameoverCommandSet.appendChild(document.createElement("br"))


		// ===============
		// バトルコマンド

		const battleCommandSet = document.createElement("div")
		this.battleCommandSet = battleCommandSet
		dom.appendChild(battleCommandSet)

		//攻撃
		const attackButton = document.createElement("button")
		attackButton.innerText = "たたかう"
		attackButton.onclick = ()=>{
			var result =  Rule1.StartBattleTurn.apply(context)
			context.apply(result)
		}
		battleCommandSet.appendChild(attackButton)
		battleCommandSet.appendChild(document.createElement("br"))


		//sleep magic
		const sleepMagic = document.createElement("button")
		sleepMagic.innerText = "スリープの魔法"
		sleepMagic.onclick = ()=>{
			var result =  Rule1.StartBattleTurn.apply(
				context,
				GameContext.ButtleActionKind.SleepMagic
			)
			context.apply(result)
		}
		battleCommandSet.appendChild(sleepMagic)
		battleCommandSet.appendChild(document.createElement("br"))


		//cure magic
		const cureMagic = document.createElement("button")
		cureMagic.innerText = "回復の魔法"
		cureMagic.onclick = ()=>{
			var result =  Rule1.StartBattleTurn.apply(
				context,
				GameContext.ButtleActionKind.CureMagic
			)
			context.apply(result)
		}
		battleCommandSet.appendChild(cureMagic)
		battleCommandSet.appendChild(document.createElement("br"))

		// GameState変更検知
		GameEvent.Manager.subscribe<GameEvent.Common.GameStateChanged>(
			new GameEvent.Common.GameStateChanged((event)=>{
				this.update()
			})
		)

		this.update()

	}

	private update(){

		this.titleCommandSet.style.display = "none"
		this.battleCommandSet.style.display = "none"
		this.gameoverCommandSet.style.display = "none"
		

		switch(this.context.state){

			case GameContext.GameState.Title :
				this.titleCommandSet.style.display = "block"
				break

			case GameContext.GameState.Battle :
				this.battleCommandSet.style.display = "block"
				break

			case GameContext.GameState.GameOver :
				this.gameoverCommandSet.style.display = "block"
				break
		}
	}
}