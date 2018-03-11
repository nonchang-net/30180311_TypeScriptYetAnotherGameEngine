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

// バトルターン評価
// playerのみactionKind振り分け

export class StartBattleTurn implements GameContext.RuleBase{
	static apply(
		context: GameContext.GameContext,
		actionKind: GameContext.ButtleActionKind = GameContext.ButtleActionKind.Attack
	): GameContext.ApplicableGameContext{
		let result = new GameContext.ApplicableGameContext()

		//フロアルール適用
		const floorRules = context.currentFloorInfo
		for(const floorRule of floorRules){
			switch(floorRule){
				case GameContext.FloorRuleKind.MPGain :
					result.append(InvokeMPGainByFloorRule.apply(context,1))
					break
				case GameContext.FloorRuleKind.MPGainHard :
					result.append(InvokeMPGainByFloorRule.apply(context,10))
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

		result.append(InvokeBattleAction.apply(context,firstActor,secondActor))
		result.append(InvokeBattleAction.apply(context,secondActor,firstActor))

		return result
	}
}

//フロア効果: 毎ターンMP回復

export class InvokeMPGainByFloorRule implements GameContext.RuleBase{
	static apply(
		context: GameContext.GameContext,
		point: number
	): GameContext.ApplicableGameContext{
		const result = new GameContext.ApplicableGameContext()

		context.player.mp.current += point
		context.player.mp.limit()
		context.enemy.mp.current += point
		context.enemy.mp.limit()
		const ev = new GameEvent.Common.InvokeFloorEffectMPGain()
		ev.point = point
		result.onApplicatedEvents.push(ev)

		return result
	}
}

//バトルアクション実行

export class InvokeBattleAction implements GameContext.RuleBase{
	static apply(
		context: GameContext.GameContext,
		actor:  GameContext.Actor,
		target: GameContext.Actor
	): GameContext.ApplicableGameContext{
		const result = new GameContext.ApplicableGameContext()

		// console.log("actor.currentButtleActionKind: ",actor.currentButtleActionKind)

		if(actor.isSleep){
			const ev = new GameEvent.Common.ActorIsSleepedAndCanNotAction()
			ev.actor = actor
			result.onApplicatedEvents.push(ev)
			return result
		}

		if(! RuleUtils.canAction(
			actor, target,
			"AttackActorToTarget.apply()"
		)){
			result.onApplicatedEvents.push(new GameEvent.Common.ERROR_UNDEFINED())
			return result
		}

		//sleepの魔法をかける
		if(actor.currentButtleActionKind == GameContext.ButtleActionKind.SleepMagic){
			return InvokeSleepMagic.apply(context, actor, target)
		}

		//回復の魔法を自分にかける
		if(actor.currentButtleActionKind == GameContext.ButtleActionKind.CureMagic){
			return InvokeCureMagic.apply(context, actor, actor)
		}

		//攻撃
		return InvokeAttack.apply(context, actor, target)
	}
}


//攻撃

export class InvokeAttack implements GameContext.RuleBase{
	static apply(
		context: GameContext.GameContext,
		actor:  GameContext.Actor,
		target: GameContext.Actor
	): GameContext.ApplicableGameContext{
		const result = new GameContext.ApplicableGameContext()

		//攻撃は1/3の確率で外れる
		if(Math.random() > 0.6){
			const ev = new GameEvent.Common.AttackMissing()
			ev.actor = actor
			result.onApplicatedEvents.push(ev)
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

		//攻撃を受けると1/2の確率で目を覚ます
		if(target.isSleep && Math.random() > 0.5){
			target.isSleep = false

			const ev = new GameEvent.Common.ActorIsWakeUp()
			ev.actor = target
			result.onApplicatedEvents.push(ev)
		}

		return result
	}
}


//スリープマジック
export class InvokeSleepMagic implements GameContext.RuleBase{

	static readonly REQUIRED_MP = 12 //TODO: MasterData化

	static apply(
		context: GameContext.GameContext,
		actor:  GameContext.Actor,
		target: GameContext.Actor
	): GameContext.ApplicableGameContext{
		const result = new GameContext.ApplicableGameContext()

		if(actor.mp.current < this.REQUIRED_MP){
			//MP足りない！ 発動せずターン終了
			const ev = new GameEvent.Common.MagicPointNotQuarified()
			ev.actor = actor
			ev.action = actor.currentButtleActionKind
			result.onApplicatedEvents.push(ev)
			return result
		}

		actor.mp.current -= this.REQUIRED_MP

		if(target.isSleep){
			//すでに寝てるよ
			const ev = new GameEvent.Common.SleepMagicAlreadySleeping()
			ev.actor = actor
			ev.target = target
			result.onApplicatedEvents.push(ev)
			return result
		}
		if(Math.random() > 0.2){
			//sleep magic成功
			target.isSleep = true
			const ev = new GameEvent.Common.SleepMagicSucceed()
			ev.actor = actor
			ev.target = target
			result.onApplicatedEvents.push(ev)
			return result
		}
		//sleep magic失敗
		const ev = new GameEvent.Common.SleepMagicFailed()
		ev.actor = actor
		ev.target = target
		result.onApplicatedEvents.push(ev)
		return result
	}
}


export class InvokeCureMagic implements GameContext.RuleBase{

	static readonly REQUIRED_MP = 3  //TODO: MasterData化
	
	static apply(
		context: GameContext.GameContext,
		actor:  GameContext.Actor,
		target: GameContext.Actor
	): GameContext.ApplicableGameContext{

		const result = new GameContext.ApplicableGameContext()


		if(actor.mp.current < this.REQUIRED_MP){
			//MP足りない！ 発動せずターン終了
			const ev = new GameEvent.Common.MagicPointNotQuarified()
			ev.actor = actor
			ev.action = actor.currentButtleActionKind
			result.onApplicatedEvents.push(ev)
			return result
		}

		actor.mp.current -= this.REQUIRED_MP

		let curePoint = Math.floor( Math.random() * 20 ) + 8
		if(actor.hp.current + curePoint > actor.hp.max){
			curePoint = actor.hp.max - actor.hp.current
		}
		target.hp.current += curePoint
		const ev = new GameEvent.Common.CureMagicSucceed()
		ev.actor = actor
		ev.target = target
		ev.curePoint = curePoint
		result.onApplicatedEvents.push(ev)
		return result
	}
}

/*
テンプレ


export class AttackActorToTarget implements GameContext.RuleBase{
	static apply(
		context: GameContext.GameContext,
		actor:  GameContext.Actor,
		target: GameContext.Actor
	): GameContext.ApplicableGameContext{
		const result = new GameContext.ApplicableGameContext()
		return result
	}
}

*/