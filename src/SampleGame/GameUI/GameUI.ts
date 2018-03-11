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

		//とりあえず
		messages.add(`${context.enemy.name}が現れた！`)


		// ===============
		// イベント購読

		// GameEvent.Manager.subscribe
		// 	<GameEvent.Common.PlayerHitPointChanged>
		// (
		// 	new GameEvent.Common.PlayerHitPointChanged(
		// 		12, //ここ、設計がおかしい。subsctiveする側が変化した内容を定義してどうする……。
		// 		(e)=>{
		// 			console.log("e.newHitPoint",e.newHitPoint)
		// 		}
		// 	)
		// )

		// GameEvent.Manager.subscribe<GameEvent.TestRule.PlayerIntoSleeping>(
		// 	new GameEvent.TestRule.PlayerIntoSleeping((event)=>{
		// 		playerStatusDiv.update(context.player)
		// 		messages.add(`sleepの魔法を受けた。${context.player.name}は眠ってしまった！`)
		// 	})
		// )

		// GameEvent.Manager.subscribe<GameEvent.TestRule.PlayerDoSleepButNotSleeping>(
		// 	new GameEvent.TestRule.PlayerDoSleepButNotSleeping((event)=>{
		// 		playerStatusDiv.update(context.player)
		// 		messages.add(`sleepの魔法を受けたが、${context.player.name}は眠っていない。`)
		// 	})
		// )


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
				messages.add(`${event.actor.name}は cure magicを唱えた！ HPが${event.curePoint}回復した。`)
			})
		)

	}
}
