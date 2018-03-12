/*

# SampleRule.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- 検討中。README.mdを参照

## メモ

- YAGEの設計では、ゲーム評価はルールの集合となる。
- Ruleクラスは非破壊処理。
	- GameContextと引数を受け取る
	- ApplicableGameContextを返す
		- これには適用時に発火したいイベントのリストを詰める

*/


import * as GameContext from '../GameContext';
import { default as GameEvents } from '../GameEvents';


class RuleUtils{

	//行動可能性チェック
	static canAction(actor: GameContext.Actor, target: GameContext.Actor, actionName: string="行動"):boolean{

		// 相手がいないのに行動しようとした
		// →エラーイベントを詰めて早期return
		if(target.hp.current <= 0){
			console.log(`想定外動作: 相手${target.name}が生存していないのに${actor.name}が${actionName}しようとしました。`);
			return false
		}

		if(actor.hp.current <= 0){
			console.log(`想定外動作: ${actor.name}が生存していないのに${actionName}しようとしました。`);
			return false
		}

		if(actor.isSleep){
			console.log(`想定外動作: ${actor.name}が寝ているのに${actionName}しようとしました。`);
			return false
		}

		return true
	}

	//ダメージ計算
	static calcDamage(baseAttack: number, random: number): number{
		return Math.floor( Math.random() * random ) + baseAttack
	}
	static calcDamageActor(actor: GameContext.Actor): number{
		return this.calcDamage(actor.attack, actor.attackVariable )
	}

}

export default class GameRules{

	private context: GameContext.GameContext
	private events: GameEvents
	public Battle: BattleRules
	public Magic: MagicRules

	constructor(
		context: GameContext.GameContext,
		events: GameEvents
	){
		this.context = context
		this.events = events
		this.Magic = new MagicRules(context, events)
		this.Battle = new BattleRules(context, events, this.Magic)
	}

}

class BattleRules{

	private context: GameContext.GameContext
	private events: GameEvents
	private Magic: MagicRules

	constructor(
		context: GameContext.GameContext,
		events: GameEvents,
		Magic: MagicRules
	){
		this.context = context
		this.events = events
		this.Magic = Magic
	}


	// バトルターン評価
	// playerのみactionKind振り分け
	StartBattleTurn(
		actionKind: GameContext.ButtleActionKind = GameContext.ButtleActionKind.Attack
	): GameContext.ApplicableGameContext{
		let result = new GameContext.ApplicableGameContext()
		const context = this.context

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
		const context = this.context

		context.player.mp.current += point
		context.player.mp.limit()
		context.enemy.mp.current += point
		context.enemy.mp.limit()

		//む。まだ発動しないイベントはどうやって入れよう。
		// const ev = this.events.FloorEffect.InvokeMPGain
		// ev.point = point
		// result.onApplicatedEvents.push(ev)

		//→新しいイベントは即時broadcastしか考慮していなかったのでそうする。遅延タイミングで何かバグらないかどうかは要検討。

		this.events.FloorEffect.InvokeMPGain.broadcast({point: point})

		return result
	}

	//バトルアクション実行
	InvokeBattleAction(
		actor:  GameContext.Actor,
		target: GameContext.Actor
	): GameContext.ApplicableGameContext{
		let result = new GameContext.ApplicableGameContext()
		const context = this.context
		// console.log("actor.currentButtleActionKind: ",actor.currentButtleActionKind)

		if(actor.isSleep){
			this.events.Battle.ActorIsSleepedAndCanNotAction.broadcast({actor: actor})
			return result
		}

		if(! RuleUtils.canAction(
			actor, target,
			"AttackActorToTarget()"
		)){
			this.events.UndefinedError.broadcast({actor: actor})
			return result
		}

		//sleepの魔法をかける
		if(actor.currentButtleActionKind == GameContext.ButtleActionKind.SleepMagic){
			return this.Magic.Sleep(actor, target)
		}

		//回復の魔法を自分にかける
		if(actor.currentButtleActionKind == GameContext.ButtleActionKind.CureMagic){
			return this.Magic.Cure(actor, actor)
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
		const context = this.context
		//攻撃は1/3の確率で外れる
		if(Math.random() > 0.6){
			this.events.Battle.ActorAttackIsMissing.broadcast({actor: actor})
			return result
		}

		const damage = RuleUtils.calcDamageActor(actor)

		if(damage >= target.hp.current){
			target.hp.current = 0
			this.events.Battle.ActorAttackIsHitAndDeflated.broadcast({actor: actor, target: target, damage: damage})
			return result
		}

		target.hp.current -= damage
		this.events.Battle.ActorAttackIsHit.broadcast({actor: actor, target: target, damage: damage})

		//攻撃を受けると1/2の確率で目を覚ます
		if(target.isSleep && Math.random() > 0.5){
			target.isSleep = false
			this.events.Battle.ActorIsWakeUp.broadcast({actor: actor})
		}
		return result
	}


	RULE_TEMPLATE(
	): GameContext.ApplicableGameContext{
		let result = new GameContext.ApplicableGameContext()
		const context = this.context
		//何かする
		return result
	}
}


class MagicRules{

	private context: GameContext.GameContext
	private events: GameEvents

	constructor(
		context: GameContext.GameContext,
		events: GameEvents
	){
		this.context = context
		this.events = events
	}


	//スリープマジック
	readonly SLEEP_REQUIRED_MP = 12 //TODO: MasterData化
	Sleep(
		actor:  GameContext.Actor,
		target: GameContext.Actor
	): GameContext.ApplicableGameContext{
		let result = new GameContext.ApplicableGameContext()
		const context = this.context

		if(actor.mp.current < this.SLEEP_REQUIRED_MP){
			//MP足りない！ 発動せずターン終了
			this.events.Battle.Magic.MagicPointNotQuarified.broadcast({actor: actor, action: actor.currentButtleActionKind})
			return result
		}

		actor.mp.current -= this.SLEEP_REQUIRED_MP

		if(target.isSleep){
			//すでに寝てるよ
			this.events.Battle.Magic.SleepWhenAlreadySleeping.broadcast({actor: actor, target: target})
			return result
		}
		if(Math.random() > 0.2){
			//sleep magic成功
			target.isSleep = true
			this.events.Battle.Magic.SleepSucceed.broadcast({actor: actor, target: target})
			return result
		}
		//sleep magic失敗
		this.events.Battle.Magic.SleepFailed.broadcast({actor: actor, target: target})
		return result
	}


	//回復魔法
	readonly CURE_REQUIRED_MP = 3  //TODO: MasterData化
	Cure(
		actor:  GameContext.Actor,
		target: GameContext.Actor
	): GameContext.ApplicableGameContext{
		let result = new GameContext.ApplicableGameContext()
		const context = this.context

		if(actor.mp.current < this.CURE_REQUIRED_MP){
			//MP足りない！ 発動せずターン終了
			this.events.Battle.Magic.MagicPointNotQuarified.broadcast({actor: actor, action: actor.currentButtleActionKind})
			return result
		}

		actor.mp.current -= this.CURE_REQUIRED_MP

		let curePoint = Math.floor( Math.random() * 20 ) + 8
		if(actor.hp.current + curePoint > actor.hp.max){
			curePoint = actor.hp.max - actor.hp.current
		}
		target.hp.current += curePoint
		this.events.Battle.Magic.CureSucceed.broadcast({actor: actor, target: target, curePoint: curePoint})
		return result
	}

	RULE_TEMPLATE(
	): GameContext.ApplicableGameContext{
		let result = new GameContext.ApplicableGameContext()
		const context = this.context
		//何かする
		return result
	}

}




