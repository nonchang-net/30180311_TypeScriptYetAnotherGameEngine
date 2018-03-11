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
import * as GameEvent from '../GameEvent';
import { default as Utils} from './GameUIUtils';
import { default as StatusDiv } from './StatusDiv';
import { default as CommandDiv } from './CommandDiv';
import { default as MessageDiv } from './MessageDiv';

export default class UI{

	constructor(
		context: GameContext.GameContext,
		uiElement: HTMLElement
	){

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
		all.appendChild(new CommandDiv(context).dom)

		//メッセージパネル
		const messages = new MessageDiv(context)
		all.appendChild(messages.dom)


		// ===============
		// イベント購読


		// GameState変更検知
		GameEvent.Manager.subscribe<GameEvent.Common.GameStateChanged>(
			new GameEvent.Common.GameStateChanged((event)=>{
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
						messages.add(`${context.enemy.name}が現れた！`)
						enemyStatus.dom.style.display = "block"
						break

					default :
						gameState.innerText = "undefined scene"
				}
			})
		)

		GameEvent.Manager.subscribe<GameEvent.Common.ActorAttackIsHit>(
			new GameEvent.Common.ActorAttackIsHit((event)=>{
				playerStatusDiv.update(context.player)
				enemyStatus.update(context.enemy)
				messages.add(`${event.target.name}は${event.damage}のダメージを受けた！`)
			})
		)

		GameEvent.Manager.subscribe<GameEvent.Common.ActorAttackIsHitAndDeflated>(
			new GameEvent.Common.ActorAttackIsHitAndDeflated((event)=>{
				playerStatusDiv.update(context.player)
				enemyStatus.update(context.enemy)
				messages.add(`${event.target.name}は倒れた！`)
				if(event.target.kind == GameContext.ActorKind.Player){
					messages.add(`GAME OVER!`)
					context.setState(GameContext.GameState.GameOver)
				}
			})
		)

		GameEvent.Manager.subscribe<GameEvent.Common.ActorIsSleepedAndCanNotAction>(
			new GameEvent.Common.ActorIsSleepedAndCanNotAction((event)=>{
				playerStatusDiv.update(context.player)
				enemyStatus.update(context.enemy)
				messages.add(`${event.actor.name}は眠っていて動けない！`)
			})
		)

		GameEvent.Manager.subscribe<GameEvent.Common.ActorIsWakeUp>(
			new GameEvent.Common.ActorIsWakeUp((event)=>{
				playerStatusDiv.update(context.player)
				enemyStatus.update(context.enemy)
				messages.add(`${event.actor.name}は目を覚ました！`)
			})
		)

		GameEvent.Manager.subscribe<GameEvent.Common.AttackMissing>(
			new GameEvent.Common.AttackMissing((event)=>{
				messages.add(`${event.actor.name}の攻撃は外れた。`)
			})
		)

		GameEvent.Manager.subscribe<GameEvent.Common.SleepMagicSucceed>(
			new GameEvent.Common.SleepMagicSucceed((event)=>{
				playerStatusDiv.update(context.player)
				enemyStatus.update(context.enemy)
				messages.add(`${event.actor.name}は sleep magicを唱えた！ ${event.target.name}は眠りにおちた！`)
			})
		)

		GameEvent.Manager.subscribe<GameEvent.Common.SleepMagicFailed>(
			new GameEvent.Common.SleepMagicFailed((event)=>{
				playerStatusDiv.update(context.player)
				enemyStatus.update(context.enemy)
				messages.add(`${event.actor.name}は sleep magicを唱えた！ しかし${event.target.name}には効かなかった！`)
			})
		)

		GameEvent.Manager.subscribe<GameEvent.Common.SleepMagicAlreadySleeping>(
			new GameEvent.Common.SleepMagicAlreadySleeping((event)=>{
				playerStatusDiv.update(context.player)
				enemyStatus.update(context.enemy)
				messages.add(`${event.actor.name}は sleep magicを唱えた！ しかし${event.target.name}はすでに眠っているため効果がなかった！`)
			})
		)

		GameEvent.Manager.subscribe<GameEvent.Common.CureMagicSucceed>(
			new GameEvent.Common.CureMagicSucceed((event)=>{
				playerStatusDiv.update(context.player)
				enemyStatus.update(context.enemy)
				messages.add(`${event.actor.name}は cure magicを唱えた！ ${event.target.name}のHPが${event.curePoint}回復した。`)
			})
		)

	}
}
