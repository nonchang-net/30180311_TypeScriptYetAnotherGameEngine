/*
# Utilities.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- YAGE全般ユーティリティクラス
	- コンポジションで持つか、単純なクラスならextendsで。

## ここでやること

- アプリ初期化
- 実行に必要なcanvasタグの取得。
	- （ここ以外で直接index.htmlのdomを取ることは避ける）

*/
// export default class Utilities{ //しまった、これSampleGame側か……。扱い考えてから再検討。
// 	subscribe<T>(arg){
// 		Event.Manager.subscribe(arg)
// 	}
// }