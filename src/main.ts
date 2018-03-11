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

	//TODO: jsonはS3にdデプロイしたい
	readonly MASTER_DATA_ENEMIES_URL: string = "https://script.googleusercontent.com/macros/echo?user_content_key=yKK-ZUzj02ZwKXWFT39B8QquttV0bC9w57OUmnUBof-pCFXaMcQ-BJdATX6I2Dymszq5_qJOMQhWpcZG1F34RX92QEzmgSyfm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnAJjrIvQ97z0RW-0xPK1w48qcTuPdn844uwwbw2T51YtYioAfvWxA81WU9kqGDrfop0mgLDwm9cO&lib=Mm0OfG4rpMmjOijnmsnJqouS5Zx1wbZ9l"

	readonly MASTER_DATA_EENEMIES_MOCKUP: string = `[
		{
			"ID": 1,
			"kind": "Enemy",
			"name": "スライム",
			"undefinedName": "粘液状の生き物",
			"attack": 1,
			"attackVariable": 3,
			"hp": 8,
			"mp": 0,
			"_AI種別": "【単一】攻撃",
			"aiKind": "#VALUE!",
			"dropKind": "TODO - aikind設定後。これも種別選択で選べるようにしたい"
		},
		{
			"ID": 2,
			"kind": "Enemy_BigBoss",
			"name": "ドラゴン",
			"undefinedName": "大型の化け物",
			"attack": 6,
			"attackVariable": 10,
			"hp": 120,
			"mp": 30,
			"_AI種別": "【複合】攻撃3 : sleep magic1",
			"aiKind": "",
			"dropKind": ""
		},
		{
			"ID": 3,
			"kind": "Enemy",
			"name": "キラービー",
			"undefinedName": "飛び回る生き物",
			"attack": 3,
			"attackVariable": 6,
			"hp": 4,
			"mp": 0,
			"_AI種別": "【単一】攻撃",
			"aiKind": "",
			"dropKind": ""
		}
	]`

	readonly ENEMIES_DATA_USE_MOCKUP = true

	constructor(uiElement: HTMLElement){
		// super()
		const context = new GameContext.GameContext
		const ui = new UI(context, uiElement)


		if(this.ENEMIES_DATA_USE_MOCKUP){
			ui.nowloading.style.display = "none"
			context.setEnemiesByMasterData(JSON.parse(this.MASTER_DATA_EENEMIES_MOCKUP))
			context.setState(GameContext.GameState.Title)
		}else{
			//S3に置いたマスターデータを取得してみる
			;(async ()=>{
				try {
					
					//テスト用: 通信待ちエミュレーション
					// await new Promise(r => setTimeout(r, 500));
	
					//fetch
					let response = await fetch(this.MASTER_DATA_ENEMIES_URL);
					return response.json();
				} catch(e) {
					console.log("Error!");
				}
			})().then((data)=>{
				console.log("fetch succeed.",data);
				ui.nowloading.style.display = "none"
				context.setEnemiesByMasterData(data)
				// 初期化イベント
				context.setState(GameContext.GameState.Title)
			})

		}


		//テスト
		// Event.Tests.test()
	}

	
}

