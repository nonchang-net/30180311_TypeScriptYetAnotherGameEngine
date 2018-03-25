/*
# MasterData.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- マスターデータ管理クラスです。

## ここでやること

- モックアップデータ定義
- モックアップJSONと、S3に置いたJSONファイルを切り替えられるように。
	- とりあえずGoogle Spread Sheetから直接読み込むテストを進行中。

*/

// import { mockupJson as ENEMIES } from './MockupJSONs/Enemies';

export var mockupJson = `[
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

import * as GameContext from '../GameContext'

// モックアップ定義
export class Mockups{
	// static readonly Enemies: string = ENEMIES
	static readonly Enemies: string = mockupJson
}

// マスターデータメインクラス
// UNDONE: とりあえずmain.tsから切り出しただけでごちゃごちゃしてる。どう整理していこう？
export class MasterData{

	readonly ENEMIES_DATA_USE_MOCKUP = true

	private context: GameContext.GameContext 

	//TODO:
	// google spread sheet直接読み込みは、API利用制限があるので内部テストが限界。
	// jsonはS3にデプロイするフローを作る必要がある。
	readonly EnemiesURL = "https://script.googleusercontent.com/macros/echo?user_content_key=yKK-ZUzj02ZwKXWFT39B8QquttV0bC9w57OUmnUBof-pCFXaMcQ-BJdATX6I2Dymszq5_qJOMQhWpcZG1F34RX92QEzmgSyfm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnAJjrIvQ97z0RW-0xPK1w48qcTuPdn844uwwbw2T51YtYioAfvWxA81WU9kqGDrfop0mgLDwm9cO&lib=Mm0OfG4rpMmjOijnmsnJqouS5Zx1wbZ9l"

	constructor(context: GameContext.GameContext){
		this.context = context
	}

	async asyncSetup(){

		if(this.ENEMIES_DATA_USE_MOCKUP){
			this.context.setEnemiesByMasterData(JSON.parse(Mockups.Enemies))
			console.log(`MasterData: USE MOCKUP!`);
		}else{
			//S3に置いたマスターデータを取得してみる
			await (async ()=>{
				try {
					
					//テスト用: 通信待ちエミュレーション
					// await new Promise(r => setTimeout(r, 500));
	
					//fetch
					let response = await fetch(this.EnemiesURL);
					return response.json();
				} catch(e) {
					console.log("Error!");
				}
			})().then((data)=>{
				console.log("MasterData: fetch succeed.", data);
				this.context.setEnemiesByMasterData(data)
			})
		}
	}
	
}