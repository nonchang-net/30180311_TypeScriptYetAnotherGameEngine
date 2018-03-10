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

// TODO: 以下はエンジン参照を避けるために、SampleGame側に置いてみた。要検討。
// export class Manager{

// 	static subscribe<T extends IEvent<T>>(
// 		event: T
// 	){
// 		event.dispatcher.subscribe(
// 			event.constructor.name,
// 			event.callback
// 		)
// 	}

// 	static broadcast<T extends IEvent<T>>(event: T){
// 		event.dispatcher.broadcast(event)
// 	}
// }

export interface IEvent<T>{
	callback: (T)=>any
	dispatcher
}

export class EventBase<T> implements IEvent<T>{
	callback: (T)=>any
	dispatcher
	constructor(callback?:(event: T)=>any){
		this.callback = callback
	}
}

// class DEBUG_EventChainCounter{
// 	static count = 0
// }

export class SimpleEventDispatcher<T>{

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

				// DEBUG_EventChainCounter.count++
				// if(DEBUG_EventChainCounter.count > 100){
				// 	console.log("ERROR: deep event call found!")
				// 	return
				// }

				handler.apply(this, arguments)
			}
		}
	}

}


export class Tests{

	// 初期テストコード
	// TODO: ちゃんとしたユニットテストに置き換えたい
	static test(){

		var eventManager1 = new SimpleEventDispatcher<SampleGameEvent1>()

		console.log("main? : "+this.constructor.name)

		eventManager1.subscribe(this.constructor.name, (event)=>{
			console.log("test1 username: " + event.username)
		})

		eventManager1.broadcast({
			username: 'Rasmus',
			success: true
		})


		eventManager1.subscribe(this.constructor.name, (event)=>{
			console.log("test2 username: " + event.username)
		})

		eventManager1.broadcast({
			username: "test",
			success: false
		})

		var eventManager2 = new SimpleEventDispatcher<SampleGameEvent2>()

		eventManager2.subscribe(this.constructor.name, ()=>{
			console.log("test3 - another event")
		})

		eventManager2.broadcast()

		//TODO: 同じ型を指定したらtest1,2にも伝播させたい。でもできてない。
		var eventManager3 = new SimpleEventDispatcher<SampleGameEvent1>()

		eventManager3.subscribe(this.constructor.name, (event)=>{
			console.log("test4 username: " + event.username)
		})

		eventManager3.broadcast({
			username: "test",
			success: false
		})
	}

}

//テスト用

interface SampleGameEvent1 {
	username: string
	success: boolean
}


interface SampleGameEvent2 {}