
import * as GameContext from '../GameContext';

export default class RuleUtils{

	//行動可能性チェック
	static canAction(actor: GameContext.Actor, target: GameContext.Actor, actionName: string="行動"):boolean{

		// 相手がいないのに行動しようとした
		// →エラーイベントを詰めて早期return
		if(target.hp.current <= 0){
			console.log(`想定外動作: 相手${target.name}が生存していないのに${actor.name}が${actionName}しようとしました。`);
			return false
		}

		if(actor.hp.current <= 0){
			console.log(`想定外動作: ${actor.name}が生存していないのに${actionName}しようとしました。`);
			return false
		}

		if(actor.isSleep){
			console.log(`想定外動作: ${actor.name}が寝ているのに${actionName}しようとしました。`);
			return false
		}

		return true
	}

	//ダメージ計算
	static calcDamage(baseAttack: number, random: number): number{
		return Math.floor( Math.random() * random ) + baseAttack
	}
	static calcDamageActor(actor: GameContext.Actor): number{
		return this.calcDamage(actor.attack, actor.attackVariable )
	}

}
