/*

# SampleRule.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- 検討中。README.mdを参照

## メモ

- Contextとは
	- Contextはただのデータクラス。
	- グローバル。
		- main.tsでnewされて、ゲームロジック全体にDIで渡される。
		- UIサブモジュールなどには「表示に必要なデータセット（playerのみとか）」を渡すこともある。でも、UIを統括するクラスはGameContextを持っている前提。

- ここでやること

- ゲームに必要な構造体・データクラスの集約

	- ゲーム状況を示す単一のストア
		- save/loadをやるとしたらここ。Unityならシリアライズも含める

		- ゲームステートの管理
		- GameState enumの他、BattleState、EventXxxStateなども出てくるかもしれない。
		- GameState.tsに分けるかどうかは状況次第で考える。
		- ステート変更通知

	- 初期データの保持？
		- これはマスターデータ配信した方が良いかも。

- ここでやらないこと

	- 値の加工（ダメージを与える、など）
		- 値の加工はあくまでGameRule側の責務……という考え方を検討中。
		- `検討中`
			- Actorにダメージを与える処理はどう考えよう？
			- ActorLogic.tsでも用意してそれに扱わせる？
			- 経験値を獲得したらレベルアップしたいよな。そういった処理はどこで担保すべき？

	- ステート変更以外のイベント通知は行わない
		- 値の変更はGameRule側の責務なので、そこで通知する。
		- 取り急ぎは、ReactivePropertyの考え方はやめておく。
			- 全部通知対象にしたら混乱しそう。

*/

import { default as SimpleEvent } from './Event';
import { default as GameEvents } from './GameEvents';

/// メインコンテキスト

export class GameContext{

	private events: GameEvents

	//要検討: ステート管理をGameContextに持たせるのは違う気がする。
	// ステートはsetされるとStateChangedイベントを発火するので、もっとゲームよりかも。
	// とりあえず単一ファイルのクラスに分離しておく……？
	private _state: GameState = GameState.Boot
	public get state(): GameState{ return this._state }
	public setState(newState: GameState){
		this._state = newState
		this.events.Common.StateChanged.broadcast()
	}

	player: Actor
	enemy: Actor //固定定義

	enemies: Array<Actor> //マスターデータ取得テスト

	get currentFloorInfo(): Array<FloorRuleKind>{
		// return []
		return [FloorRuleKind.MPGain]
	}

	constructor(events: GameEvents){
		this.events = events
		this.init()
	}

	init(){
		this.player = new Actor()
		this.player.kind = ActorKind.Player
		this.player.name = "勇者"
		this.player.attack = 3
		this.player.attackVariable = 5
		this.player.hp = new MaxLimitedNumber(30)
		this.player.mp = new MaxLimitedNumber(100)
		this.player.isSleep = false

		//note: enemyはenemies(マスター|モック)データを参照して切り替わります
		this.enemy = new Actor()
	}

	setEnemiesByMasterData(json){
		this.enemies = new Array<Actor>()
		for(const master of json){
			// console.log(master);
			const actor: Actor = new Actor
			actor.name = master.name
			actor.attack = master.attack
			actor.attackVariable = master.attackVariable
			actor.hp = new MaxLimitedNumber(master.hp)
			actor.mp = new MaxLimitedNumber(master.mp)
			this.enemies.push(actor)
		}
		console.log(this.enemies)
	}

	setNextEnemy(){
		this.enemy = this.enemies[Math.floor(Math.random()*this.enemies.length)]
	}

	//TODO: 要検討
	apply(newContext: ApplicableGameContext){
		if(newContext.playerIsSleep !== null){
			this.player.isSleep = newContext.playerIsSleep
		}
		for(const event of newContext.onApplicatedEvents){
			// console.log(event)
			event.broadcast()
		}
	}

}

export enum GameState{
	Boot,
	Title,
	Battle,
	BattleResult,
	GameOver,
}



//要検討: 以下はGameRules側に定義すべきかも
export enum ButtleActionKind{
	Attack,
	SleepMagic,
	CureMagic,
}

//場所によるルール種別。フロアセルがListで持つことを想定しているのでNormalはない。（つまり、ルール適用がない場合はListが空。）
export enum FloorRuleKind{
	MPGain, //行動のたびにMPが1回復する
	MPGainHard, //行動のたびにMPが10回復する「マナが潤沢なフロア＝悪魔に都合が良い世界」
	MPDrain, //行動のたびにMPが1ずつ減っていく
	MPDrainHard, //MPが10ずつ減っていく: 「物理攻撃力がモノを言う世界」

	HPDrain, //行動のたびにHPが1ずつ減っていく - 「毒の床」
	HPDrainHard, //行動のたびにHPが10ずつ減っていく - 「一刻も早くここから逃げ出さないと！」
}

//適用コンテキスト

// export class ApplicableGameContext implements YAGEContext.IApplicableContext{
export class ApplicableGameContext{
	playerIsSleep:boolean|null = null
	onApplicatedEvents = []

	//コンテキストのマージ
	append(appendContest: ApplicableGameContext){
		this.playerIsSleep = appendContest.playerIsSleep
		this.onApplicatedEvents = this.onApplicatedEvents.concat(appendContest.onApplicatedEvents)
	}
}


//TODO: 基本データ型はDataDefinitionフォルダに分けるべきかも

/// プレイヤー・敵の情報クラス
export class Actor{

	kind: ActorKind

	name: string
	hp: MaxLimitedNumber = new MaxLimitedNumber(0) //HP
	attack: number //基礎攻撃力
	attackVariable: number //追加ランダム攻撃力(仮)
	deffence: number //基礎防御力
	satiety: number //満腹度 0.0-1.0

	mp: MaxLimitedNumber = new MaxLimitedNumber(0) //HP

	currentButtleActionKind: ButtleActionKind

	// 保留中: このActorに関するstate change eventを個別に登録できないか検討した跡。
	// deflatedEvent,
	// damagedEvent,

	// 要検討: ステータスフラグは単一クラスにすべきか？
	isSleep: boolean = false
}

export class Status{
	status: {[kind:number]:boolean}//enumをキーにしたdictionaryを作りたい……けど無理そう
}
export enum StatusKind{
	Poison,
	Sleep,
	DeepSleep,
	AutoHeal,
}

export enum ActorKind{
	Player,
	Enemy
}

// Commonフォルダに分けるべきかも

// 最大値で制限されるパラメータ
// TODO: setterで代入監視したい
class MaxLimitedNumber{
	current: number
	max: number
	constructor(max: number){
		this.current = this.max = max
	}
	limit(){
		if(this.current > this.max) this.current = this.max
	}
}