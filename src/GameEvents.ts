/*

# GameEvents.ts

Copyright(C) xxx. All rights reserved.

## 概要

シンプルなイベント表現

*/

import { default as Event } from './Event';
import * as GameContext from './GameContext';


export default class Events{
	UndefinedError = new Event()
	Common = new CommonEvents()
	Battle = new BattleEvents()
	FloorEffect = new FloorEffectEvents()
}

class CommonEvents{
	StateChanged = new Event()
}

class BattleEvents{
	//TestRule
	IntoSleeping = new Event() //PlayerIntoSleeping
	// NotSleeping = new Event() //PlayerDoSleepButNotSleeping

	//actorがtargetにダメージを与えた
	ActorAttackIsHit = new Event<{
		actor: GameContext.Actor,
		target: GameContext.Actor,
		damage: number
	}>()

	//actorがtargetにダメージを与えて倒した
	ActorAttackIsHitAndDeflated = new Event<{
		actor: GameContext.Actor,
		target: GameContext.Actor,
		damage: number
	}>()

	//actorは寝ていて動けない
	ActorIsSleepedAndCanNotAction = new Event<{
		actor: GameContext.Actor
	}>()

	//actorが目を覚ました
	ActorIsWakeUp = new Event<{
		actor: GameContext.Actor
	}>()

	//actorの攻撃が外れた
	ActorAttackIsMissing = new Event<{
		actor: GameContext.Actor
	}>()

	Magic = new BattleMagicEvents()

}

class BattleMagicEvents{

	//MPが足りない
	MagicPointNotQuarified = new Event<{
		actor: GameContext.Actor,
		action: GameContext.ButtleActionKind
	}>()

	SleepSucceed = new Event<{
		actor: GameContext.Actor,
		target: GameContext.Actor
	}>()

	SleepFailed = new Event<{
		actor: GameContext.Actor,
		target: GameContext.Actor
	}>()

	SleepWhenAlreadySleeping = new Event<{
		actor: GameContext.Actor,
		target: GameContext.Actor
	}>()

	CureSucceed = new Event<{
		actor: GameContext.Actor,
		target: GameContext.Actor,
		curePoint: number
	}>()

}

class FloorEffectEvents{

	InvokeMPGain = new Event<{
		point: number
	}>()
}
