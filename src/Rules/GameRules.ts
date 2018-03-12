/*

# SampleRule.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- 検討中。README.mdを参照

## メモ


- Rulesフォルダは、ゲーム評価と処理ルーチンの集合体

- Ruleクラスは非破壊処理。
	- GameContextと引数を受け取る
	- ApplicableGameContextを返す
		- これには適用時に発火したいイベントのリストを詰める

- ……この考え方、やめるかも。

	- イベントを整理したら発火したいイベントそのものを透過的に変数格納できなくなった。
		- これについては別途考えてもいいかも。

	- 非破壊に徹する意味が今のところない。どうせ破壊的修正を加えるだろう？
		- 「プレイログ」を考えた時には価値が出てくるけど、この場合重要なのは「ルールを実行したこと」を逐一保存できることだ。ルールの実行内容を変数に格納できる必要はなくないか……？


	- Ruleとは？
		- 実行すると、Contextに変更を加える
		- 実行すると、イベントを発火することがある
			- 無限ループに注意
			- とりあえずは紳士協定で。根本的に無限ループが起こらないようなフロー整理は検討中……。
			- 本質的に課題がある。
				- イベントを受け取ってルール評価したい
				- ルール評価されたらイベントを出したい
				- これをどう整理していくかを考えていく。
		- Ruleはサブルールを実行することがある

*/


import * as GameContext from '../GameContext';
import { default as GameEvents } from '../GameEvents';
import { default as RuleUtils } from './RuleUtils';


// ゲーム全体ルール
// 全てのサブルールを持つ
export default class GameRules{

	context: GameContext.GameContext
	events: GameEvents
	Magic: MagicRules
	Item: ItemRules
	Battle: BattleRules
	Camp: CampRules

	constructor(
		context: GameContext.GameContext,
		events: GameEvents
	){
		this.context = context
		this.events = events
		this.Item = new ItemRules(this)
		this.Magic = new MagicRules(this)
		this.Camp = new CampRules(this)
		this.Battle = new BattleRules(this)
	}

}



// アイテム使用ルール
class ItemRules{
	private parent: GameRules
	constructor( parent: GameRules ){
		this.parent = parent
	}
}


// キャンプ中ルール
class CampRules{
	private parent: GameRules
	constructor( parent: GameRules ){
		this.parent = parent
	}
}

// バトル中ルール
class BattleRules{
	private parent: GameRules
	constructor( parent: GameRules ){
		this.parent = parent
	}

	// バトルターン評価
	// playerのみactionKind振り分け
	StartBattleTurn(
		actionKind: GameContext.ButtleActionKind = GameContext.ButtleActionKind.Attack
	): GameContext.ApplicableGameContext{
		let result = new GameContext.ApplicableGameContext()
		const context = this.parent.context

		//フロアルール適用
		const floorRules = context.currentFloorInfo
		for(const floorRule of floorRules){
			switch(floorRule){
				case GameContext.FloorRuleKind.MPGain :
					result.append(this.InvokeMPGainByFloorRule(1))
					break
				case GameContext.FloorRuleKind.MPGainHard :
					result.append(this.InvokeMPGainByFloorRule(10))
					break
			}
		}

		//行動種別をcontextに保存
		context.player.currentButtleActionKind = actionKind
		//敵は一旦一律でattack
		context.enemy.currentButtleActionKind = GameContext.ButtleActionKind.Attack

		//1/3の確率でプレイヤーが先制攻撃
		let firstActor = context.player
		let secondActor = context.enemy
		if(Math.random() > 0.3){
			firstActor = context.enemy
			secondActor = context.player
		}

		result.append(this.InvokeBattleAction(firstActor,secondActor))
		result.append(this.InvokeBattleAction(secondActor,firstActor))

		return result
	}


	//フロア効果: 毎ターンMP回復
	InvokeMPGainByFloorRule(
		point: number
	): GameContext.ApplicableGameContext{
		let result = new GameContext.ApplicableGameContext()
		const context = this.parent.context

		context.player.mp.current += point
		context.player.mp.limit()
		context.enemy.mp.current += point
		context.enemy.mp.limit()

		//む。まだ発動しないイベントはどうやって入れよう。本当はresultに含めて、発動はcontext.applyのタイミングにしたかった。（強い動機はない）
		// const ev = this.events.FloorEffect.InvokeMPGain
		// ev.point = point
		// result.onApplicatedEvents.push(ev)

		//→新しいイベントは即時broadcastしか考慮していなかったのでそうする。遅延タイミングで何かバグらないかどうかは要検討。

		this.parent.events.FloorEffect.InvokeMPGain.broadcast({point: point})

		return result
	}

	//バトルアクション実行
	InvokeBattleAction(
		actor:  GameContext.Actor,
		target: GameContext.Actor
	): GameContext.ApplicableGameContext{
		let result = new GameContext.ApplicableGameContext()
		const context = this.parent.context
		// console.log("actor.currentButtleActionKind: ",actor.currentButtleActionKind)

		if(actor.isSleep){
			this.parent.events.Battle.ActorIsSleepedAndCanNotAction.broadcast({actor: actor})
			return result
		}

		if(! RuleUtils.canAction(
			actor, target,
			"AttackActorToTarget()"
		)){
			this.parent.events.UndefinedError.broadcast({actor: actor})
			return result
		}

		//sleepの魔法をかける
		if(actor.currentButtleActionKind == GameContext.ButtleActionKind.SleepMagic){
			return this.parent.Magic.Sleep(actor, target)
		}

		//回復の魔法を自分にかける
		if(actor.currentButtleActionKind == GameContext.ButtleActionKind.CureMagic){
			return this.parent.Magic.Cure(actor, actor)
		}

		//攻撃
		return this.InvokeAttack(actor, target)
	}


	//攻撃
	InvokeAttack(
		actor:  GameContext.Actor,
		target: GameContext.Actor
	): GameContext.ApplicableGameContext{
		let result = new GameContext.ApplicableGameContext()
		const context = this.parent.context
		//攻撃は1/3の確率で外れる
		if(Math.random() > 0.6){
			this.parent.events.Battle.ActorAttackIsMissing.broadcast({actor: actor})
			return result
		}

		const damage = RuleUtils.calcDamageActor(actor)

		if(damage >= target.hp.current){
			target.hp.current = 0
			this.parent.events.Battle.ActorAttackIsHitAndDeflated.broadcast({actor: actor, target: target, damage: damage})
			context.setState(GameContext.GameState.BattleResult)
			return result
		}

		target.hp.current -= damage
		this.parent.events.Battle.ActorAttackIsHit.broadcast({actor: actor, target: target, damage: damage})

		//攻撃を受けると1/2の確率で目を覚ます
		if(target.isSleep && Math.random() > 0.5){
			target.isSleep = false
			this.parent.events.Battle.ActorIsWakeUp.broadcast({actor: actor})
		}
		return result
	}


	RULE_TEMPLATE(
	): GameContext.ApplicableGameContext{
		let result = new GameContext.ApplicableGameContext()
		const context = this.parent.context
		//何かする
		return result
	}
}


class MagicRules{

	private parent: GameRules
	constructor( parent: GameRules ){
		this.parent = parent
	}

	//スリープマジック
	readonly SLEEP_REQUIRED_MP = 12 //TODO: MasterData化
	Sleep(
		actor:  GameContext.Actor,
		target: GameContext.Actor
	): GameContext.ApplicableGameContext{
		let result = new GameContext.ApplicableGameContext()
		const context = this.parent.context

		if(actor.mp.current < this.SLEEP_REQUIRED_MP){
			//MP足りない！ 発動せずターン終了
			this.parent.events.Battle.Magic.MagicPointNotQuarified.broadcast({actor: actor, action: actor.currentButtleActionKind})
			return result
		}

		actor.mp.current -= this.SLEEP_REQUIRED_MP

		if(target.isSleep){
			//すでに寝てるよ
			this.parent.events.Battle.Magic.SleepWhenAlreadySleeping.broadcast({actor: actor, target: target})
			return result
		}
		if(Math.random() > 0.2){
			//sleep magic成功
			target.isSleep = true
			this.parent.events.Battle.Magic.SleepSucceed.broadcast({actor: actor, target: target})
			return result
		}
		//sleep magic失敗
		this.parent.events.Battle.Magic.SleepFailed.broadcast({actor: actor, target: target})
		return result
	}


	//回復魔法
	readonly CURE_REQUIRED_MP = 3  //TODO: MasterData化
	Cure(
		actor:  GameContext.Actor,
		target: GameContext.Actor
	): GameContext.ApplicableGameContext{
		let result = new GameContext.ApplicableGameContext()
		const context = this.parent.context

		if(actor.mp.current < this.CURE_REQUIRED_MP){
			//MP足りない！ 発動せずターン終了
			this.parent.events.Battle.Magic.MagicPointNotQuarified.broadcast({actor: actor, action: actor.currentButtleActionKind})
			return result
		}

		actor.mp.current -= this.CURE_REQUIRED_MP

		let curePoint = Math.floor( Math.random() * 20 ) + 8
		if(actor.hp.current + curePoint > actor.hp.max){
			curePoint = actor.hp.max - actor.hp.current
		}
		target.hp.current += curePoint
		this.parent.events.Battle.Magic.CureSucceed.broadcast({actor: actor, target: target, curePoint: curePoint})
		return result
	}

	RULE_TEMPLATE(
	): GameContext.ApplicableGameContext{
		let result = new GameContext.ApplicableGameContext()
		const context = this.parent.context
		//何かする
		return result
	}

}




