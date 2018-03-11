import * as GameContext from '../GameContext';
import * as GameEvent from '../GameEvent';
import { default as Utils} from './GameUIUtils';


//プレイヤー、敵キャラクター共有ブロック表現
export default class StatusDiv{

	dom: HTMLDivElement

	private hpString = "HP: [[]]"
	private hp: HTMLParagraphElement
	private mpString = "MP: [[]]"
	private mp: HTMLParagraphElement

	private nameString = "name: [[0]][[1]]"
	private name: HTMLParagraphElement
	
	private satiety: HTMLParagraphElement
	private attack: HTMLParagraphElement
	private deffence: HTMLParagraphElement
	private status: HTMLParagraphElement

	constructor(actorContext: GameContext.Actor){
		const dom = document.createElement("div")
		this.dom = dom
		dom.style.border = "1px solid gray"
		dom.style.borderRadius = "5px"
		dom.style.marginBottom = "1em"
		dom.style.padding = "0.5em"

		this.name = Utils.GetPraragraph(this.nameString)
		dom.appendChild(this.name)

		this.hp = Utils.GetPraragraph()
		dom.appendChild(this.hp)

		this.mp = Utils.GetPraragraph()
		dom.appendChild(this.mp)

		// const satiety = Utils.GetPraragraph("satiety: [[]]")
		// dom.appendChild(satiety)

		this.update(actorContext)
	}


	update(actorContext: GameContext.Actor){
		//TODO: HPが1/10になったら全体を赤文字にしたい

		let statusText = "";
		if(actorContext.isSleep){
			statusText = " (睡眠)"
		}

		this.name.innerHTML = this.nameString.replace(
			"[[0]]",
			actorContext.name
		).replace(
			"[[1]]",
			statusText
		)

		this.hp.innerHTML = this.hpString.replace(
			"[[]]",
			actorContext.hp.current.toString() + " / " + 
			actorContext.hp.max.toString()
		)

		this.mp.innerHTML = this.mpString.replace(
			"[[]]",
			actorContext.mp.current.toString() + " / " + 
			actorContext.mp.max.toString()
		)
	}

}