/*
# main.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- webpackビルドのエントリポイントです。

## ここでやること

- アプリ初期化
- 一時的なテストコード書く場所

*/
import { GameContext } from './SampleGame/GameContext'
import { default as UI } from './SampleGame/GameUI/GameUI'
import * as Rule1 from './SampleGame/Rules/GameRule1'

import * as Event from './SampleGame/GameEvent';

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
	}

	
}

