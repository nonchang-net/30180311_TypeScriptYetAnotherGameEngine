/*

# SampleRule.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- 検討中。README.mdを参照

## メモ


- Rulesフォルダは、ゲーム評価と処理ルーチンの集合体

- Ruleクラスは非破壊処理。
	- GameContextと引数を受け取る
	- ApplicableGameContextを返す
		- これには適用時に発火したいイベントのリストを詰める

- ……この考え方、やめるかも。

	- イベントを整理したら発火したいイベントそのものを透過的に変数格納できなくなった。
		- これについては別途考えてもいいかも。

	- 非破壊に徹する意味が今のところない。どうせ破壊的修正を加えるだろう？
		- 「プレイログ」を考えた時には価値が出てくるけど、この場合重要なのは「ルールを実行したこと」を逐一保存できることだ。ルールの実行内容を変数に格納できる必要はなくないか……？


	- Ruleとは？
		- 実行すると、Contextに変更を加える
		- 実行すると、イベントを発火することがある
			- 無限ループに注意
			- とりあえずは紳士協定で。根本的に無限ループが起こらないようなフロー整理は検討中……。
			- 本質的に課題がある。
				- イベントを受け取ってルール評価したい
				- ルール評価されたらイベントを出したい
				- これをどう整理していくかを考えていく。
		- Ruleはサブルールを実行することがある

*/


import * as GameContext from '../GameContext';
import { default as GameEvents } from '../GameEvents';

import { default as Utils } from './Utils';

// 汎用ルール
import { default as MagicRules } from './Magics';
import { default as ItemRules } from './Items';

// 状況別ルールセット
import { default as BattleRules } from './Battle';
import { default as CampRules } from './Camp';


// ゲーム全体ルール
// 全てのサブルールを持つ
export default class GameRules{

	context: GameContext.GameContext
	events: GameEvents
	Magic: MagicRules
	Item: ItemRules
	Battle: BattleRules
	Camp: CampRules

	constructor(
		context: GameContext.GameContext,
		events: GameEvents
	){
		this.context = context
		this.events = events
		this.Item = new ItemRules(this)
		this.Magic = new MagicRules(this)
		this.Camp = new CampRules(this)
		this.Battle = new BattleRules(this)
	}

}



