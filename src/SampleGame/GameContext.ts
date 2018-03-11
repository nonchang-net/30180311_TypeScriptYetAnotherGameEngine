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

import * as YAGEContext from '../YetAnotherGameEngine/Context';
import {IRule, IRuleParent} from '../YetAnotherGameEngine/Rule';

import * as Event from '../YetAnotherGameEngine/Event';
import * as GameEvent from './GameEvent';

/// メインコンテキスト

// export class GameContext implements YAGEContext.IContext{
export class GameContext{

	private _state: GameState = GameState.Boot
	public get state(): GameState{ return this._state }
	public setState(newState: GameState){
		this._state = newState
		GameEvent.Manager.broadcast(new GameEvent.Common.GameStateChanged())
	}

	player: Actor
	enemy: Actor

	constructor(){
		this.init()
	}

	init(){
		this.player = new Actor()
		this.player.kind = ActorKind.Player
		this.player.name = "勇者"
		this.player.attack = 3
		this.player.attackVariable = 5
		this.player.hp = new MaxLimitedNumber(30)
		this.player.isSleep = false

		this.enemy = new Actor()
		this.enemy.kind = ActorKind.Enemy
		this.enemy.name = "ドラゴン"
		this.enemy.attack = 6
		this.enemy.attackVariable = 10
		this.enemy.hp = new MaxLimitedNumber(120)
		this.enemy.isSleep = false
	}

	apply(newContext: ApplicableGameContext){
		if(newContext.playerIsSleep !== null){
			this.player.isSleep = newContext.playerIsSleep
		}
		for(const event of newContext.onApplicatedEvents){
			// console.log(event)
			GameEvent.Manager.broadcast(event)
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

export enum ButtleActionKind{
	Attack,
	SleepMagic,
	CureMagic,
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

// ルール制約クラス（？）

export class RuleBase implements IRule{}


/// プレイヤー・敵の情報クラス
export class Actor{

	kind: ActorKind

	name: string
	hp: MaxLimitedNumber //HP
	attack: number //基礎攻撃力
	attackVariable: number //追加ランダム攻撃力(仮)
	deffence: number //基礎防御力
	satiety: number //満腹度 0.0-1.0

	currentButtleActionKind: ButtleActionKind

	// 保留中: このActorに関するstate change eventを個別に登録できないか検討した跡。
	// deflatedEvent,
	// damagedEvent,

	isSleep: boolean
	// constructor(){
	// 	this.hp = new MaxLimitedNumber()
	// }
}

export enum ActorKind{
	Player,
	Enemy
}

/// 最大値で制限されるパラメータ
class MaxLimitedNumber{
	current: number
	max: number
	constructor(max: number){
		this.current = this.max = max
	}
}