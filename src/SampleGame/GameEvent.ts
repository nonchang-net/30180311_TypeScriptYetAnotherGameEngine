/*

# UI.ts

Copyright(C) xxx. All rights reserved.

## 概要

- 検討中。README.mdを参照

## 検討内容の一時メモ

- イベントについて「考えることを最小化する」方法を検討しなきゃ。
	- ボタンがこのクラスを経由して、「testscene.button1_clicked」といったイベントを送出してくることを考えている。
	- 購読している全てにinvokeする。
	- reduxでは「ツリー(json)で表現されたアプリ全体のイベントをまとめておく」という構造を取るとかなんとか。

- 今回挑戦したのは、enumや文字列渡しによる表現を排除すること。全てのイベントはEventBaseを継承した型として表現される。
	- ……無理があったかなぁ。

	- 20180310現時点では、動くのだけど、イベントクラス側にボイラープレートコードを書く必要がある。
		- 惜しい。
		- でもイベントクラスを追加するだけで利用できるようになった。
		- あちこち弄り回さずにイベント追加していける仕組みとしては、かなりいい感じ。

- 全てをイベントで扱うために、イベントクラスを量産するイメージ。

- TODO
	- staticだとgenericsを判定できないので、boilerplateコードが必要になってしまった……。なんとかならんのかなこれ。。
		- staticに頼らずに型別のdictionaryを作れるといいのだけど。型パラメータTから文字列を得る方法もないのでなんとも……。

	- 利用側が「YetAnotherGameEngine/Event」をimportする必要がある状態は可能なら避けたい。
		- ManagerのコードはYAGE側に置きたい……
		- 一旦は、ここにManagerコードを置く。あまり理想的ではない。

*/

import * as Event from '../YetAnotherGameEngine/Event';
import * as GameContext from './GameContext';

//TODO: 以下は共通コードなのでYAGE側に置きたい感。
//	ただ、ここに置かないと利用側にYAGEを参照させてしまうことになるので悩みどころ。ブリッジするほどのコードでもないんだよなぁ……。
export class Manager{

	static subscribe<T extends Event.IEvent<T>>(
		event: T
	){
		event.dispatcher.subscribe(
			event.constructor.name,
			event.callback
		)
	}

	static broadcast<T extends Event.IEvent<T>>(event: T){
		event.dispatcher.broadcast(event)
	}

}


// ゲーム中に必要なイベント定義。
// 全てここにまとめていく。

export namespace TestUI{

	export class ButtonClick1 extends Event.EventBase<ButtonClick1>{
		name: string

		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<ButtonClick1> = new Event.SimpleEventDispatcher<ButtonClick1>()
		get dispatcher(){ return ButtonClick1._dispatcher }
	}

	export class ButtonClick2 extends Event.EventBase<ButtonClick2>{
		name: string

		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<ButtonClick2> = new Event.SimpleEventDispatcher<ButtonClick2>()
		get dispatcher(){ return ButtonClick2._dispatcher }
	}
}

export namespace TestRule{

	export class PlayerIntoSleeping extends Event.EventBase<PlayerIntoSleeping>{
		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<PlayerIntoSleeping> = new Event.SimpleEventDispatcher<PlayerIntoSleeping>()
		get dispatcher(){ return PlayerIntoSleeping._dispatcher }
	}

	export class PlayerDoSleepButNotSleeping extends Event.EventBase<PlayerDoSleepButNotSleeping>{
		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<PlayerDoSleepButNotSleeping> = new Event.SimpleEventDispatcher<PlayerDoSleepButNotSleeping>()
		get dispatcher(){ return PlayerDoSleepButNotSleeping._dispatcher }
	}

}


export namespace Common{

	// 評価エラーイベント（検討中。エラーイベントを大量に作るよりはlog出してこのエラー返すだけで良いのでは、と判断）
	export class ERROR_UNDEFINED extends Event.EventBase<ERROR_UNDEFINED>{
		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<ERROR_UNDEFINED> = new Event.SimpleEventDispatcher<ERROR_UNDEFINED>()
		get dispatcher(){ return ERROR_UNDEFINED._dispatcher }
	}

	export class GameStateChanged extends Event.EventBase<GameStateChanged>{
		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<GameStateChanged> = new Event.SimpleEventDispatcher<GameStateChanged>()
		get dispatcher(){ return GameStateChanged._dispatcher }
	}

	//actorがtargetにダメージを与えた
	export class ActorAttackIsHit extends Event.EventBase<ActorAttackIsHit>{
		actor: GameContext.Actor
		target: GameContext.Actor
		damage: number
		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<ActorAttackIsHit> = new Event.SimpleEventDispatcher<ActorAttackIsHit>()
		get dispatcher(){ return ActorAttackIsHit._dispatcher }
	}

	//actorがtargetにダメージを与えて倒した
	export class ActorAttackIsHitAndDeflated extends Event.EventBase<ActorAttackIsHitAndDeflated>{
		actor: GameContext.Actor
		target: GameContext.Actor
		damage: number
		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<ActorAttackIsHitAndDeflated> = new Event.SimpleEventDispatcher<ActorAttackIsHitAndDeflated>()
		get dispatcher(){ return ActorAttackIsHitAndDeflated._dispatcher }
	}

	//actorは寝ていて動けない
	export class ActorIsSleepedAndCanNotAction extends Event.EventBase<ActorIsSleepedAndCanNotAction>{
		actor: GameContext.Actor
		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<ActorIsSleepedAndCanNotAction> = new Event.SimpleEventDispatcher<ActorIsSleepedAndCanNotAction>()
		get dispatcher(){ return ActorIsSleepedAndCanNotAction._dispatcher }
	}

	//actorが目を覚ました
	export class ActorIsWakeUp extends Event.EventBase<ActorIsWakeUp>{
		actor: GameContext.Actor
		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<ActorIsWakeUp> = new Event.SimpleEventDispatcher<ActorIsWakeUp>()
		get dispatcher(){ return ActorIsWakeUp._dispatcher }
	}

	//actorの攻撃が外れた
	export class AttackMissing extends Event.EventBase<AttackMissing>{
		actor: GameContext.Actor
		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<AttackMissing> = new Event.SimpleEventDispatcher<AttackMissing>()
		get dispatcher(){ return AttackMissing._dispatcher }
	}


	//sleep magic

	//sleep magicが成功した
	export class SleepMagicSucceed extends Event.EventBase<SleepMagicSucceed>{
		actor: GameContext.Actor
		target: GameContext.Actor
		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<SleepMagicSucceed> = new Event.SimpleEventDispatcher<SleepMagicSucceed>()
		get dispatcher(){ return SleepMagicSucceed._dispatcher }
	}

	//sleep magicが失敗した
	export class SleepMagicFailed extends Event.EventBase<SleepMagicFailed>{
		actor: GameContext.Actor
		target: GameContext.Actor
		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<SleepMagicFailed> = new Event.SimpleEventDispatcher<SleepMagicFailed>()
		get dispatcher(){ return SleepMagicFailed._dispatcher }
	}

	//眠ってる相手にsleep magicをかけようとした
	export class SleepMagicAlreadySleeping extends Event.EventBase<SleepMagicAlreadySleeping>{
		actor: GameContext.Actor
		target: GameContext.Actor
		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<SleepMagicAlreadySleeping> = new Event.SimpleEventDispatcher<SleepMagicAlreadySleeping>()
		get dispatcher(){ return SleepMagicAlreadySleeping._dispatcher }
	}

	//cure magic

	//cure magicが成功した
	export class CureMagicSucceed extends Event.EventBase<CureMagicSucceed>{
		actor:  GameContext.Actor
		target: GameContext.Actor
		curePoint: number
		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<CureMagicSucceed> = new Event.SimpleEventDispatcher<CureMagicSucceed>()
		get dispatcher(){ return CureMagicSucceed._dispatcher }
	}

}