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

	// 敵がいないのに攻撃しようとした際のエラーイベント
	// - 検討中。エラーイベントを色々定義し始めるときりがない気がする……。また、想定外エラーで細かくエラーイベントを返しても利用側にできることはない。
	// export class ERROR_PlayerAttackToDeflatedEnemy extends Event.EventBase<ERROR_PlayerAttackToDeflatedEnemy>{
	// 	//boilerplate
	// 	static _dispatcher: Event.SimpleEventDispatcher<ERROR_PlayerAttackToDeflatedEnemy> = new Event.SimpleEventDispatcher<ERROR_PlayerAttackToDeflatedEnemy>()
	// 	get dispatcher(){ return ERROR_PlayerAttackToDeflatedEnemy._dispatcher }
	// }


	// プレイヤーヒットポイント変更通知
	//? これ何か設計間違ってるかも……。
	// - プレイヤーのヒットポイントが変更したことだけ通知すれば、あとはGameContextから対象の情報は取れるかな。
	// - ただ、イベント経由で追加情報を渡す方法が固まってないような。
	export class PlayerHitPointChanged extends Event.EventBase<PlayerHitPointChanged>{

		newHitPoint: number

		constructor(
			newHitPoint: number,
			callback?:(event: PlayerHitPointChanged)=>any
		){
			super(callback)
			this.newHitPoint = newHitPoint
		}

		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<PlayerHitPointChanged> = new Event.SimpleEventDispatcher<PlayerHitPointChanged>()
		get dispatcher(){ return PlayerHitPointChanged._dispatcher }
	}

	//敵がダメージを受けた
	export class EnemyDamaged extends Event.EventBase<EnemyDamaged>{
		damage: number = -999
		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<EnemyDamaged> = new Event.SimpleEventDispatcher<EnemyDamaged>()
		get dispatcher(){ return EnemyDamaged._dispatcher }
	}

	//敵を倒した
	export class EnemyDeflated extends Event.EventBase<EnemyDeflated>{
		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<EnemyDeflated> = new Event.SimpleEventDispatcher<EnemyDeflated>()
		get dispatcher(){ return EnemyDeflated._dispatcher }
	}


	//プレイヤーがダメージを受けた
	export class PlayerDamaged extends Event.EventBase<PlayerDamaged>{
		damage: number = -999
		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<PlayerDamaged> = new Event.SimpleEventDispatcher<PlayerDamaged>()
		get dispatcher(){ return PlayerDamaged._dispatcher }
	}

	//プレイヤーが倒された
	export class PlayerDeflated extends Event.EventBase<PlayerDeflated>{
		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<PlayerDeflated> = new Event.SimpleEventDispatcher<PlayerDeflated>()
		get dispatcher(){ return PlayerDeflated._dispatcher }
	}


	//actor, targetを指定できるように汎用化

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

	//actorの攻撃が外れた
	export class AttackMissing extends Event.EventBase<AttackMissing>{
		actor: GameContext.Actor
		//boilerplate
		static _dispatcher: Event.SimpleEventDispatcher<AttackMissing> = new Event.SimpleEventDispatcher<AttackMissing>()
		get dispatcher(){ return AttackMissing._dispatcher }
	}
}