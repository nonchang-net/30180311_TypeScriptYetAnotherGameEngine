/*

# SampleRule.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- 検討中。README.mdを参照

*/

import * as YAGEContext from '../YetAnotherGameEngine/Context';
import {IRule, IRuleParent} from '../YetAnotherGameEngine/Rule';

import * as Event from '../YetAnotherGameEngine/Event';
import * as GameEvent from './Event';

/// メインコンテキスト

// export class GameContext implements YAGEContext.IContext{
export class GameContext{

	player: Actor
	enemy: Actor

	constructor(){
		this.player = new Actor()
		this.player.name = "testPlayer1"
		this.player.hp = new MaxLimitedNumber(30)
		this.player.isSleep = false

		this.enemy = new Actor()
		this.enemy.name = "dragon"
		this.enemy.hp = new MaxLimitedNumber(120)
		this.enemy.isSleep = false
	}

	apply(newContext: ApplicableGameContext){
		if(newContext.playerIsSleep !== null){
			this.player.isSleep = newContext.playerIsSleep
		}
		for(const event of newContext.onApplicatedEvents){
			// console.log(event)
			GameEvent.Manager.broadcast(event)
		}
	}
}


//適用コンテキスト

// export class ApplicableGameContext implements YAGEContext.IApplicableContext{
export class ApplicableGameContext{
	playerIsSleep:boolean|null = null
	onApplicatedEvents = []
}

// ルール制約クラス（？）

export class RuleBase implements IRule{}


/// プレイヤー
export class Actor{
	name: string
	hp: MaxLimitedNumber //HP
	attack: Number //基礎攻撃力
	deffence: Number //基礎防御力
	satiety: Number //満腹度 0.0-1.0

	isSleep: boolean
	// constructor(){
	// 	this.hp = new MaxLimitedNumber()
	// }
}

/// 最大値で制限されるパラメータ
class MaxLimitedNumber{
	current: Number
	max: Number
	constructor(max:number){
		this.current = this.max = max
	}
}