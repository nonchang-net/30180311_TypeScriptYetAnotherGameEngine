// バトル中ルール

import * as GameContext from '../GameContext';
import { default as GameRules } from './Game';
import { default as Utils } from './Utils';

export default class BattleRules{

	private parent: GameRules
	constructor( parent: GameRules ){
		this.parent = parent
	}

	// バトルターン評価
	// playerのみactionKind振り分け
	StartBattleTurn(
		actionKind: GameContext.ButtleActionKind = GameContext.ButtleActionKind.Attack
	){
		const context = this.parent.context

		//フロアルール適用
		const floorRules = context.currentFloorInfo
		for(const floorRule of floorRules){
			switch(floorRule){
				case GameContext.FloorRuleKind.MPGain :
					this.InvokeMPGainByFloorRule(1)
					break
				case GameContext.FloorRuleKind.MPGainHard :
					this.InvokeMPGainByFloorRule(10)
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

		this.InvokeBattleAction(firstActor,secondActor)
		this.InvokeBattleAction(secondActor,firstActor)
	}


	//フロア効果: 毎ターンMP回復
	InvokeMPGainByFloorRule(
		point: number
	){
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
		return
	}

	//バトルアクション実行
	InvokeBattleAction(
		actor:  GameContext.Actor,
		target: GameContext.Actor
	){
		const context = this.parent.context
		// console.log("actor.currentButtleActionKind: ",actor.currentButtleActionKind)

		//寝てる？
		if(actor.isSleep){
			this.parent.events.Battle.ActorIsSleepedAndCanNotAction.broadcast({actor: actor})
			return
		}

		//動ける？
		if(! Utils.canAction(
			actor, target,
			"AttackActorToTarget()"
		)){
			this.parent.events.UndefinedError.broadcast({actor: actor})
			return
		}

		//sleepの魔法をかける
		if(actor.currentButtleActionKind == GameContext.ButtleActionKind.SleepMagic){
			this.parent.Magic.Sleep(actor, target)
			return
		}

		//回復の魔法を自分にかける
		if(actor.currentButtleActionKind == GameContext.ButtleActionKind.CureMagic){
			this.parent.Magic.Cure(actor, actor)
			return
		}

		//デバッグ: 最大力の攻撃で倒す
		if(actor.currentButtleActionKind == GameContext.ButtleActionKind.DEBUG_MaxAttack){
			this.InvokeAttackWithDamagePoint(actor, target, 999999)
			return
		}

		//攻撃
		this.InvokeAttack(actor, target)
	}


	//攻撃
	InvokeAttack(
		actor:  GameContext.Actor,
		target: GameContext.Actor
	){
		const context = this.parent.context
		//攻撃は1/3の確率で外れる
		if(Math.random() > 0.6){
			this.parent.events.Battle.ActorAttackIsMissing.broadcast({actor: actor})
			return
		}

		const damage = Utils.calcDamageActor(actor)

		this.InvokeAttackWithDamagePoint(actor, target, damage)
	}

	//定数で攻撃 - デバッグ用と通常攻撃用をまとめた
	private InvokeAttackWithDamagePoint(
		actor:  GameContext.Actor,
		target: GameContext.Actor,
		damage: number
	){
		const context = this.parent.context
		if(damage >= target.hp.current){
			target.hp.current = 0
			this.parent.events.Battle.ActorAttackIsHitAndDeflated.broadcast({actor: actor, target: target, damage: damage})
			if(target.kind == GameContext.ActorKind.Player){
				context.setState(GameContext.GameState.GameOver)
			}else{
				context.setState(GameContext.GameState.BattleResult)
			}
			return
		}

		target.hp.current -= damage
		this.parent.events.Battle.ActorAttackIsHit.broadcast({actor: actor, target: target, damage: damage})

		//攻撃を受けると1/2の確率で目を覚ます
		if(target.isSleep && Math.random() > 0.5){
			target.isSleep = false
			this.parent.events.Battle.ActorIsWakeUp.broadcast({actor: actor})
		}
	}


	RULE_TEMPLATE(
	){
		const context = this.parent.context
		//何かする
		return
	}



}
