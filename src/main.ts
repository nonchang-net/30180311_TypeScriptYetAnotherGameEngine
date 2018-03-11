/*
# main.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- webpackビルドのエントリポイントです。

## ここでやること

- アプリ初期化
- 一時的なテストコード書く場所

*/
import * as GameContext from './SampleGame/GameContext'
import { default as UI } from './SampleGame/GameUI/GameUI'
// import * as Rule1 from './SampleGame/Rules/GameRule1'

import * as GameEvent from './SampleGame/GameEvent';

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

	//TODO: 専用のマスターデータ作成TODO
	readonly MASTER_DATA_URL: string = "https://s3-ap-northeast-1.amazonaws.com/thirty-five-engineer-blogspot-files/inventory/items.json"

	constructor(uiElement: HTMLElement){
		// super()
		const context = new GameContext.GameContext
		const ui = new UI(context, uiElement)

		//S3に置いたマスターデータを取得してみる
		;(async ()=>{
			try {
				//テスト用: 通信待ちエミュレーション
				await new Promise(r => setTimeout(r, 500));
				//fetch
				let response = await fetch(this.MASTER_DATA_URL);
				return response.json();
			} catch(e) {
				console.log("Error!");
			}
		})().then((data)=>{
			// console.log("fetch succeed.",data);
			ui.nowloading.style.display = "none"
		})

		// 初期化イベント
		context.setState(GameContext.GameState.Title)

		//テスト
		// Event.Tests.test()
	}

	
}

