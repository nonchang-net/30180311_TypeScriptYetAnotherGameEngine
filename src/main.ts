/*
# main.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- webpackビルドのエントリポイントです。

## ここでやること

- アプリ初期化
- 一時的なテストコード書く場所

*/
import * as GameContext from './GameContext'
import { default as UI } from './GameUI/GameUI'
import { default as GameEvents } from './GameEvents';
import { default as GameRules } from './Rules/Game';

import * as MasterData from './MasterData/MasterData';


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

class Main{

	constructor(uiElement: HTMLElement){

		//基本セット初期化
		const events = new GameEvents()
		const context = new GameContext.GameContext(events)

		//UNDONE: 検討中。Ruleの初期化前にマスターデータの初期化が必要だろうか……？
		// - 例えばある魔法の必要MPの定義はマスターデータに起きたいだろう。
		// - でも、初期化は順序に依存させたくないかなぁ。
		// 	- マスターデータはnowloadingのためにui初期化済みであることを要求し、UIはrulesが初期化済みであることを要求している。すでに順序依存は発生しているわけだ。
		// - そうなると、rulesはcontextを介してマスターデータを参照させるべきだろうか。
		// - その考えで問題が発生しないか、よく検討する必要がある。
		const rules = new GameRules(context, events)

		const ui = new UI(context, events, rules, uiElement)

		const masterData = new MasterData.MasterData(context)

		//非同期初期化系の処理をasync/awaitでwrap
		;(async ()=>{
			ui.nowloading.style.display = "block"
			await masterData.asyncSetup()
			ui.nowloading.style.display = "none"
	
			// 初期化イベント
			context.setState(GameContext.GameState.Title)
		})()

		// テスト
		// TODO: ちゃんとしたユニットテストに置き換えたい。フロー調べる。mocha導入？
		// Event.Tests.test()
	}

}

