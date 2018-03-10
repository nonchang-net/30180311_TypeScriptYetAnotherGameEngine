/*

# Rule.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- 検討中。README.mdを参照

*/

import {IContext, IApplicableContext} from './Context';

export interface IRule{
	// 検討中。Rule.evaluteは「コンテキストと引数を受け取ってIApplicableContextを返す」のだけど、引数が確定しない。どういったinterfaceにするのが良いか作りながら考える
	// evalute(context:IContext, args?:any): IApplicableContext
}

export interface IRuleParent extends IRule{
	children: Array<IRule>
}