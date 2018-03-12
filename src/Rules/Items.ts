// アイテム使用ルール

import * as GameContext from '../GameContext';
import { default as GameRules } from './Game';
import { default as Utils } from './Utils';

export default class ItemRules{
	private parent: GameRules
	constructor( parent: GameRules ){
		this.parent = parent
	}
}
