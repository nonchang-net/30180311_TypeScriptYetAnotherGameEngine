//Magicルール

import * as GameContext from '../GameContext';
import { default as GameRules } from './Game';
import { default as Utils } from './Utils';

export default class MagicRules{

	private parent: GameRules
	constructor( parent: GameRules ){
		this.parent = parent
	}

	//スリープマジック
	readonly SLEEP_REQUIRED_MP = 12 //TODO: MasterData化
	Sleep(
		actor:  GameContext.Actor,
		target: GameContext.Actor
	){
		const context = this.parent.context

		if(actor.mp.current < this.SLEEP_REQUIRED_MP){
			//MP足りない！ 発動せずターン終了
			this.parent.events.Battle.Magic.MagicPointNotQuarified.broadcast({actor: actor, action: actor.currentButtleActionKind})
		}

		actor.mp.current -= this.SLEEP_REQUIRED_MP

		if(target.isSleep){
			//すでに寝てるよ
			this.parent.events.Battle.Magic.SleepWhenAlreadySleeping.broadcast({actor: actor, target: target})
		}
		if(Math.random() > 0.2){
			//sleep magic成功
			target.isSleep = true
			this.parent.events.Battle.Magic.SleepSucceed.broadcast({actor: actor, target: target})
		}
		//sleep magic失敗
		this.parent.events.Battle.Magic.SleepFailed.broadcast({actor: actor, target: target})
	}


	//回復魔法
	readonly CURE_REQUIRED_MP = 3  //TODO: MasterData化
	Cure(
		actor:  GameContext.Actor,
		target: GameContext.Actor
	){
		const context = this.parent.context

		if(actor.mp.current < this.CURE_REQUIRED_MP){
			//MP足りない！ 発動せずターン終了
			this.parent.events.Battle.Magic.MagicPointNotQuarified.broadcast({actor: actor, action: actor.currentButtleActionKind})
		}

		actor.mp.current -= this.CURE_REQUIRED_MP

		let curePoint = Math.floor( Math.random() * 20 ) + 8
		if(actor.hp.current + curePoint > actor.hp.max){
			curePoint = actor.hp.max - actor.hp.current
		}
		target.hp.current += curePoint
		this.parent.events.Battle.Magic.CureSucceed.broadcast({actor: actor, target: target, curePoint: curePoint})
	}

}

