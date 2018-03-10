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

- 今回挑戦したのは、enumや文字列渡しによるイベントを排除すること。全てのイベントはEventBaseを継承した型として表現される。
	- 20180310現時点ではイベントクラスにボイラープレートコードを書く必要があるという嫌な感じがある。
		- とはいえ、イベント別にsubscribeさせる必要があるのは間違いないのでなんらかの形でこの仕組みは必要になりそう。

- 全てをイベントで扱うために、イベントクラスを量産するイメージ。

- TODO
	- staticだとgenericsを判定できないので、boilerplateコードが必要になってしまった……。なんとかならんのかなこれ。。
		- staticに頼らずに型別のdictionaryを作れるといいのだけど。型パラメータTから文字列を得る方法もないのでなんとも……。

	- 利用側が「YetAnotherGameEngine/Event」をimportする必要がある状態は可能なら避けたい。何か方法はあるか？

*/

import * as Event from '../YetAnotherGameEngine/Event';

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

//
export namespace Common{

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
}