/*

# UI.ts

Copyright(C) xxx. All rights reserved.

## 概要

- サンプルゲームのUI
- 設計思想としては、「あまり作り込まない」
	- エンジンの動作サンプルなので動けばいい
- 表示は愚直にDOM生成を試していく
	- reactとかやってる時代にバカなことをやってる感じはある
	- でも簡単なサンプル実装の段階なので、大きな部品に依存はしたくない

*/

import * as Context from './Context';

import * as Event from './Event';

export default class UI{

	private context: Context.GameContext
	private uiElement: HTMLElement

	// private dirty: boolean = true


	constructor(
		context: Context.GameContext,
		uiElement: HTMLElement
	){
		// console.log("UI constructor")

		// DI
		this.context = context
		this.uiElement = uiElement

		// init
		this.init()
	}


	private init(){

		const all = document.createElement("div")
		all.style.padding = "0.5em"
		this.uiElement.appendChild(all)

		const h1 = document.createElement("h1")
		h1.style.fontSize = "12px"
		h1.innerText="awesome my game!"
		all.appendChild(h1)

		const clockParagraph = document.createElement("p")
		all.appendChild(clockParagraph)

		const testParagraph = document.createElement("p")
		all.appendChild(testParagraph)

		//テストボタン1
		const testButton1 = document.createElement("button")
		testButton1.innerText = "スリープの魔法"
		testButton1.onclick = ()=>{
			Event.Manager.broadcast(
				new Event.TestUI.ButtonClick1()
			)
		}
		all.appendChild(testButton1)

		//テストボタン2
		const testButton2 = document.createElement("button")
		testButton2.innerText = "test2"
		testButton2.onclick = ()=>{
			Event.Manager.broadcast(
				new Event.TestUI.ButtonClick2()
			)
		}
		all.appendChild(testButton2)


		//ステータスパネル - player
		const playerStatusDiv = new StatusDiv(this.context.player)
		all.appendChild(playerStatusDiv.dom)

		//ステータスパネル - enemy
		const enemyStatus = new StatusDiv(this.context.enemy)
		all.appendChild(enemyStatus.dom)


		//定期実行テスト
		// setInterval(()=>this.update(), 1000)

		// イベント購読テスト
		// note: UIコンポーネントでやることではない。ゲームの基礎管理クラスがやるべきこと。
		// Event.Manager.subscribe<Event.TestUI.ButtonClick1>(
		// 	new Event.TestUI.ButtonClick1((event)=>{
		// 		console.log("ButtonClick1: subscribed...! ")
		// 	})
		// )

		// Event.Manager.subscribe<Event.TestUI.ButtonClick2>(
		// 	new Event.TestUI.ButtonClick2((event)=>{
		// 		console.log("ButtonClick2: subscribed! ")
		// 	})
		// )

		// 一般ステータス変化を購読
		Event.Manager.subscribe<Event.TestRule.PlayerIntoSleeping>(
			new Event.TestRule.PlayerIntoSleeping((event)=>{
				this.updatePlayerNameAndState()
			})
		)
		Event.Manager.subscribe<Event.TestRule.PlayerDoSleepButNotSleeping>(
			new Event.TestRule.PlayerDoSleepButNotSleeping((event)=>{
				this.updatePlayerNameAndState()
			})
		)

		this.update()
	}


	private update(){
		// console.log(this.clockParagraph)
		// this.clockParagraph.innerText = Date.now().toString()
		// this.dirty = false
		this.updatePlayerNameAndState()
	}

	private updatePlayerNameAndState(){
		// this.testParagraph.innerText = this.context.player.name

		// if(this.context.player.isSleep){
		// 	this.testParagraph.innerText += " [眠り]"

		// 	//無限ループ抑制テスト:

		// }

	}
}

class Utils{
	static GetPraragraph(body: string): HTMLParagraphElement{
		const p = document.createElement("p")
		p.innerHTML = body
		return p
	}
}

//プレイヤー、敵キャラクター共有ブロック表現
class StatusDiv{

	dom: HTMLDivElement

	private hpString = "hp: [[]]"
	private hp: HTMLParagraphElement

	private nameString = "name: [[0]][[1]]"
	private name: HTMLParagraphElement
	
	private satiety: HTMLParagraphElement
	private attack: HTMLParagraphElement
	private deffence: HTMLParagraphElement
	private status: HTMLParagraphElement

	constructor(actorContext: Context.Actor){
		const dom = document.createElement("div")
		this.dom = dom
		dom.style.border = "1px solid gray"
		dom.style.borderRadius = "5px"
		dom.style.marginBottom = "1em"
		dom.style.padding = "0.5em"

		this.name = Utils.GetPraragraph(this.nameString)
		dom.appendChild(this.name)

		this.hp = Utils.GetPraragraph(this.hpString)
		dom.appendChild(this.hp)

		const satiety = Utils.GetPraragraph("satiety: [[]]")
		dom.appendChild(satiety)

		//イベント購読
		Event.Manager.subscribe
			<Event.Common.PlayerHitPointChanged>
		(
			new Event.Common.PlayerHitPointChanged(
				12,
				(e)=>{
					console.log("e.newHitPoint",e.newHitPoint)
				}
			)
		)

		// 一般ステータス変化を購読
		Event.Manager.subscribe<Event.TestRule.PlayerIntoSleeping>(
			new Event.TestRule.PlayerIntoSleeping((event)=>{
				this.update(actorContext)
			})
		)
		Event.Manager.subscribe<Event.TestRule.PlayerDoSleepButNotSleeping>(
			new Event.TestRule.PlayerDoSleepButNotSleeping((event)=>{
				this.update(actorContext)
			})
		)

		this.update(actorContext)
	}


	update(actorContext: Context.Actor){
		//TODO: HPが1/10になったら全体を赤文字にしたい

		let statusText = "";
		if(actorContext.isSleep){
			statusText = " (睡眠)"
		}

		this.name.innerHTML = this.nameString.replace(
			"[[0]]",
			actorContext.name
		).replace(
			"[[1]]",
			statusText
		)

		this.hp.innerHTML = this.hpString.replace(
			"[[]]",
			actorContext.hp.current.toString() + " / " + 
			actorContext.hp.max.toString()
		)
	}

}