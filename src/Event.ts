/*

# Event.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- DOMを使わないシンプルなイベント
- 発行はbroadcastのみ
- 購読・購読解除のsubscribe、unsubscribe

## TODO

- ユニットテスト書かなきゃ

*/



//boilerplate
export default class SimpleEvent<T>{

	private _handlers

	subscribe(subscriberName: string, func: (arg:T)=>any){
		if(!this._handlers){
			this._handlers = {}
		}
		if(!this._handlers[subscriberName]){
			this.init(subscriberName)
		}
		this._handlers[subscriberName].push(func);
	}

	unsubscribe(subscriberName: string){
		this.init(subscriberName)
	}

	private init(subscriberName: string){
		this._handlers[subscriberName] = []
	}

	broadcast(arg?:T) {
		for (const subscriberName in this._handlers){
			for (const handler of this._handlers[subscriberName]) {
				handler.apply(this, arguments)
			}
		}
	}
}



//=======================
// イベント定義サンプル
// TODO: ちゃんとしたユニットテストに置き換えたい。メインコードからは外す。

class SampleEvent{
	// イベント定義はここに並べて行く
	Move = new SimpleEvent()
	// コンポジションで階層化していく
	Store = new StoreEvents()
	Battle = new BattleEvents()
}

class StoreEvents{
	BuyItem = new SimpleEvent()
}

class BattleEvents{
	Damaged = new SimpleEvent<{ damage: number }>()
}


export class Tests{

	constructor(){

		//イベント購読名はthis.constructor.nameを利用
		console.log("subscriber name: ", this.constructor.name)

		//GameUIやGameContextにはコンストラクタで渡す
		const events = new SampleEvent();

		//イベント購読1
		events.Battle.Damaged.subscribe(this.constructor.name, e=>{
			console.log("Move: subscribed! ",e.damage)
		})

		//イベント購読2(引数なし)
		events.Store.BuyItem.subscribe(this.constructor.name, ()=>{
			console.log("Store.BuyItem: subscribed!")
		})

		//ブロードキャスト
		events.Battle.Damaged.broadcast({damage: 2345})

		//購読解除
		events.Battle.Damaged.unsubscribe(this.constructor.name)

		//unsubscribeしたのでもう受け取らない
		events.Battle.Damaged.broadcast({damage: 1234})

		//こっちはまだ受け取る
		events.Store.BuyItem.broadcast()

	}

}
