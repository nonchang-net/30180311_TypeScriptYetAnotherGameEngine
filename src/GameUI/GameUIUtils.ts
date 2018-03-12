// note: 省力化のためのstatic utilities

import * as GameContext from '../GameContext';
// import * as GameEvent from '../GameEvents';

export default class Utils{

	static GetPraragraph(body: string=""): HTMLParagraphElement{
		const p = document.createElement("p")
		p.innerHTML = body
		return p
	}

}