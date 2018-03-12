
// キャンプ中ルール
import * as GameContext from '../GameContext';
import { default as GameRules } from './Game';
import { default as Utils } from './Utils';

export default class CampRules{
	private parent: GameRules
	constructor( parent: GameRules ){
		this.parent = parent
	}
}
