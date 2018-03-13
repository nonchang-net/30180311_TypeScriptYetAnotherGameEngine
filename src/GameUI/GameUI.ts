/*

# UI.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- サンプルゲームのProof of ConceptのUIです。

- 設計思想としては、「あまり作り込まない」
	- エンジンの動作サンプルなので動けばいい

- 表示は愚直にDOM生成を試していく
	- reactとかやってる時代にバカなことをやってる感じはある
	- でも簡単なサンプル実装の段階なので、大きな部品に依存はしたくない

*/

import * as GameContext from '../GameContext';
import { default as GameEvents } from '../GameEvents';
import { default as GameRules } from '../Rules/Game';
import { default as Utils} from './GameUIUtils';
import { default as StatusDiv } from './StatusDiv';
import { default as CommandDiv } from './CommandDiv';
import { default as MessageDiv } from './MessageDiv';

export default class UI{

	nowloading: HTMLDivElement

	constructor(
		context: GameContext.GameContext,
		events: GameEvents,
		rules: GameRules,
		uiElement: HTMLElement
	){

		const nowloading = document.createElement("div")
		this.nowloading = nowloading
		nowloading.innerHTML=`
			now loading...
		`
		{
			let style=nowloading.style
			// style.display = "table-cell"
			style.position = "absolute"
			style.textAlign = "center"
			// style.verticalAlign = "middle"
			style.background = "rgba(200,200,200,0.8)"
			style.width = "100%"
			style.height = "100%"
		}
		uiElement.appendChild(nowloading)


		const all = document.createElement("div")
		all.style.padding = "0.5em"
		uiElement.appendChild(all)

		const h1 = document.createElement("h1")
		h1.style.fontSize = "12px"
		h1.innerText="awesome my game!"
		all.appendChild(h1)

		const h2 = document.createElement("h1")
		h2.innerText="game state"
		all.appendChild(h2)

		const gameState = document.createElement("p")
		all.appendChild(gameState)

		const clockParagraph = document.createElement("p")
		all.appendChild(clockParagraph)

		const testParagraph = document.createElement("p")
		all.appendChild(testParagraph)


		//ステータスパネル - player
		const playerStatusDiv = new StatusDiv(context.player)
		all.appendChild(playerStatusDiv.dom)

		//ステータスパネル - enemy
		const enemyStatus = new StatusDiv(context.enemy)
		all.appendChild(enemyStatus.dom)

		//コマンドパネル
		all.appendChild(new CommandDiv(context, events, rules).dom)

		//メッセージパネル
		const messages = new MessageDiv(context)
		all.appendChild(messages.dom)


		// ===============
		// イベント購読


		// GameState変更検知
		events.Common.StateChanged.subscribe(
			this.constructor.name,
			e=>{
				switch(context.state){

					case GameContext.GameState.Title :
						gameState.innerText = "title scene"
						messages.reset()
						messages.add(`あなたは洞窟の前に立っている。`)
						playerStatusDiv.update(context.player)
						enemyStatus.dom.style.display = "none"
						break

					case GameContext.GameState.Battle :
						gameState.innerText = "battle scene"
						messages.add(`あなたは洞窟に入った。`)
						context.setNextEnemy()
						enemyStatus.update(context.enemy)
						enemyStatus.dom.style.display = "block"
						messages.add(`${context.enemy.name}が現れた！`)
						break

					case GameContext.GameState.BattleResult :
						gameState.innerText = "battle result scene"
						messages.add(`戦闘に勝利した。`)


					default :
						gameState.innerText = "undefined scene"
				}
			}
		)

		events.Battle.ActorAttackIsHit.subscribe(
			this.constructor.name,
			(e)=>{
				playerStatusDiv.update(context.player)
				enemyStatus.update(context.enemy)
				messages.add(`${e.target.name}は${e.damage}のダメージを受けた！`)
			}
		)

		events.Battle.ActorAttackIsHitAndDeflated.subscribe(
			this.constructor.name,
			(e)=>{
				playerStatusDiv.update(context.player)
				enemyStatus.update(context.enemy)
				messages.add(`${e.target.name}は${e.damage}のダメージをを受けた。勇者は倒れた！`)
				if(e.target.kind == GameContext.ActorKind.Player){
					messages.add(`GAME OVER!`)
				}
			}
		)

		events.Battle.ActorIsSleepedAndCanNotAction.subscribe(
			this.constructor.name,
			(e)=>{
				playerStatusDiv.update(context.player)
				enemyStatus.update(context.enemy)
				messages.add(`${e.actor.name}は眠っていて動けない！`)
			}
		)

		events.Battle.ActorIsWakeUp.subscribe(
			this.constructor.name,
			(e)=>{
				playerStatusDiv.update(context.player)
				enemyStatus.update(context.enemy)
				messages.add(`${e.actor.name}は目を覚ました！`)
			}
		)

		events.Battle.ActorAttackIsMissing.subscribe(
			this.constructor.name,
			(e)=>{
				messages.add(`${e.actor.name}の攻撃は外れた。`)
			}
		)




		//MAGIC!

		events.Battle.Magic.MagicPointNotQuarified.subscribe(
			this.constructor.name,
			(e)=>{
				messages.add(`${e.actor.name}は魔法を唱えようとしたが、MPが足りない！`)
			}
		)
		events.Battle.Magic.SleepSucceed.subscribe(
			this.constructor.name,
			(e)=>{
				playerStatusDiv.update(context.player)
				enemyStatus.update(context.enemy)
				messages.add(`${e.actor.name}は sleep magicを唱えた！ ${e.target.name}は眠りにおちた！`)
			}
		)
		events.Battle.Magic.SleepFailed.subscribe(
			this.constructor.name,
			(e)=>{
				playerStatusDiv.update(context.player)
				enemyStatus.update(context.enemy)
				messages.add(`${e.actor.name}は sleep magicを唱えた！ しかし${e.target.name}には効かなかった！`)
			}
		)
		events.Battle.Magic.SleepWhenAlreadySleeping.subscribe(
			this.constructor.name,
			(e)=>{
				playerStatusDiv.update(context.player)
				enemyStatus.update(context.enemy)
				messages.add(`${e.actor.name}は sleep magicを唱えた！ しかし${e.target.name}はすでに眠っているため効果がなかった！`)
			}
		)
		events.Battle.Magic.CureSucceed.subscribe(
			this.constructor.name,
			(e)=>{
				playerStatusDiv.update(context.player)
				enemyStatus.update(context.enemy)
				messages.add(`${e.actor.name}は cure magicを唱えた！ ${e.target.name}のHPが${e.curePoint}回復した。`)
			}
		)


		//floor effects
		events.FloorEffect.InvokeMPGain.subscribe(
			this.constructor.name,
			(e)=>{
				playerStatusDiv.update(context.player)
				enemyStatus.update(context.enemy)
				if(e.point>=10){
					messages.add(`異常な濃度の霊気によりMPが${e.point}回復した。`)
				}else{
					messages.add(`潤沢な霊気の加護によりMPが${e.point}回復した。`)
				}
			}
		)



	}
}
