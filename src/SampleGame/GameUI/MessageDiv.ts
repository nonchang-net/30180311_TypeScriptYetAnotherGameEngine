/*

# GameUI/MessageDiv.ts

## 概要

- メッセージ表示UI
	- 古いメッセージは順次消えて行く。

*/

import * as GameContext from '../GameContext';
import * as GameEvent from '../GameEvent';
import { default as Utils} from './GameUIUtils';

export default class MessageDiv{
	dom: HTMLDivElement

	private readonly MESSAGE_SLOT_MAX: number = 5

	messageSlots: Array<HTMLParagraphElement>

	count=0

	constructor(context: GameContext.GameContext){
		const dom = document.createElement("div")
		this.dom = dom

		//見出し
		const commandHeader = document.createElement("h2")
		commandHeader.innerText = "メッセージ"
		dom.appendChild(commandHeader)

		//メッセージスロット追加
		this.messageSlots = new Array<HTMLParagraphElement>()

		for(var i=0 ; i<this.MESSAGE_SLOT_MAX ; i++){
			const messageSlot = document.createElement("p")
			if(i!=0){
				messageSlot.style.color = "#999"
			}
			dom.appendChild(messageSlot)
			this.messageSlots.push(messageSlot)
		}

		//メッセージ追加テストボタン
		// const testButton = document.createElement("button")
		// testButton.innerText = "test: メッセージ追加"
		// testButton.onclick = ()=>{
		// 	this.add("message: "+this.count)
		// 	this.count++
		// }
		// dom.appendChild(testButton)

	}

	add(newMessage: string){
		for(var i=this.messageSlots.length - 1 ; i>0 ; i--){
			this.messageSlots[i].innerText =
				this.messageSlots[i-1].innerText
		}
		this.messageSlots[0].innerText = newMessage
	}
}