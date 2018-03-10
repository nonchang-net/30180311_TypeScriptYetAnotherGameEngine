/*
# main.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- webpackビルドのエントリポイントです。

## ここでやること

- アプリ初期化
- 実行に必要なcanvasタグの取得。
	- （ここ以外で直接index.htmlのdomを取ることは避ける）

*/
import { GameContext } from './SampleGame/Context'
import { default as UI } from './SampleGame/UI'
import * as Rule1 from './SampleGame/Rules/SampleRule1'

import * as Event from './SampleGame/Event';

// Windowスコープを拡張: コンソールからMainのpublic要素にアクセスできるように
// 例: console.log("test",window.Main.dirty) //note: 実行時はjavascriptなので、privateプロパティも参照できる点に注意
declare global{
	interface Window{
		Main?
	}
}

// bootstrap
window.addEventListener('DOMContentLoaded', () => {
	window.Main = new Main(
		document.querySelector('div#ui')
	);
});

//shorthand class test
class Utils{
	subscribe<T>(arg){
		Event.Manager.subscribe(arg)
	}
}

class Main extends Utils{

	constructor(uiElement: HTMLElement){
		super()
		let context: GameContext = new GameContext
		new UI(context, uiElement)

		//とりあえず簡単なテスト
		// Event.Tests.test()

		// UIイベント購読テスト
		this.subscribe<Event.TestUI.ButtonClick1>(
			new Event.TestUI.ButtonClick1((event)=>{
				// console.log("ButtonClick1: subscribed by Main.ts ")

				//ルール実行、適用差分取得
				var result =  Rule1.DoSleepMagicToPlayer.apply(context)
				//適用差分をコンテキストに適用、イベント実行
				context.apply(result)

				// var reulst = 
			})
		)

		// Rule Apply時のイベント購読
		this.subscribe<Event.TestRule.PlayerIntoSleeping>(
			new Event.TestRule.PlayerIntoSleeping((event)=>{
				console.log("プレイヤーは眠ってしまった！")
			})
		)
		this.subscribe<Event.TestRule.PlayerDoSleepButNotSleeping>(
			new Event.TestRule.PlayerDoSleepButNotSleeping((event)=>{
				console.log("プレイヤーは眠っていない。")
			})
		)


	}

	
}

