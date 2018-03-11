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
import * as GameEvent from '../GameEvent';


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

export class BattleTurn implements GameContext.RuleBase{
	static apply(context: GameContext.GameContext): GameContext.ApplicableGameContext{
		let result = new GameContext.ApplicableGameContext()

		//1/3の確率でプレイヤーが先制攻撃
		let firstActor = context.player
		let secondActor = context.enemy
		if(Math.random() > 0.3){
			firstActor = context.enemy
			secondActor = context.player
		}

		result = AttackActorToTarget.apply(context,firstActor,secondActor)
		result.append(AttackActorToTarget.apply(context,secondActor,firstActor))

		return result
	}
}

export class AttackActorToTarget implements GameContext.RuleBase{
	static apply(
		context: GameContext.GameContext,
		actor:  GameContext.Actor,
		target: GameContext.Actor
	): GameContext.ApplicableGameContext{
		const result = new GameContext.ApplicableGameContext()

		if(! RuleUtils.canAction(
			actor, target,
			"AttackActorToTarget.apply()"
		)){
			result.onApplicatedEvents.push(new GameEvent.Common.ERROR_UNDEFINED())
			return result
		}

		const damage = RuleUtils.calcDamageActor(actor)

		if(damage >= target.hp.current){
			target.hp.current = 0
			const ev = new GameEvent.Common.ActorAttackIsHitAndDeflated()
			ev.actor = actor
			ev.target = target
			ev.damage = damage
			result.onApplicatedEvents.push(ev)
			return result
		}

		target.hp.current -= damage
		const ev = new GameEvent.Common.ActorAttackIsHit()
		ev.actor = actor
		ev.target = target
		ev.damage = damage
		result.onApplicatedEvents.push(ev)

		return result
	}
}



//プレイヤーに眠る魔法をかけるテスト
// export class DoSleepMagicToPlayer implements GameContext.RuleBase{
// 	static apply(context: GameContext.GameContext):
// 	GameContext.ApplicableGameContext
// 	{
// 		const result = new GameContext.ApplicableGameContext()
// 		result.playerIsSleep = Math.random()*3 > 1.5 ? true : false

// 		// console.log("result.playerIsSleep",result.playerIsSleep)

// 		if(result.playerIsSleep){
// 			result.onApplicatedEvents.push(new GameEvent.TestRule.PlayerIntoSleeping())
// 		}else{
// 			result.onApplicatedEvents.push(new GameEvent.TestRule.PlayerDoSleepButNotSleeping())
// 		}

// 		return result
// 	}
// }