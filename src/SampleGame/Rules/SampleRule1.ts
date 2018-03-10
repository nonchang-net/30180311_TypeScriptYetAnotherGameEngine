/*

# SampleRule.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- 検討中。README.mdを参照

*/


import * as Context from '../Context';
import * as Event from '../Event';

// import {IContext, IApplicableContext} from '../../YetAnotherGameEngine/Context';
// import {IRule, IRuleParent} from '../../YetAnotherGameEngine/Rule';


export class DoSleepMagicToPlayer implements Context.RuleBase{
	static apply(context: Context.GameContext):
		Context.ApplicableGameContext
	{
		const result = new Context.ApplicableGameContext()
		result.playerIsSleep = Math.random()*3 > 1.5 ? true : false

		// console.log("result.playerIsSleep",result.playerIsSleep)

		if(result.playerIsSleep){
			result.onApplicatedEvents.push(new Event.TestRule.PlayerIntoSleeping())
		}else{
			result.onApplicatedEvents.push(new Event.TestRule.PlayerDoSleepButNotSleeping())
		}

		return result
	}
}